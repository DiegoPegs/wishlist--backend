import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ChangePasswordDto } from '../../dtos/auth/change-password.dto';
import { CognitoService } from '../../../infrastructure/services/cognito.service';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly cognitoService: CognitoService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    changePasswordDto: ChangePasswordDto,
    accessToken: string,
  ): Promise<void> {
    // Decodificar o JWT token para obter o user ID
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(accessToken);
    const userId = decoded.sub;

    if (!userId) {
      throw new UnauthorizedException('Token inválido');
    }

    // Buscar o usuário no banco para obter o username/email
    const user = await this.userRepository.findByIdIncludingInactive(userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const username = user.username || user.email;
    if (!username) {
      throw new UnauthorizedException('Username não encontrado');
    }

    // Para validação de senha atual, precisamos fazer login no Cognito primeiro
    // Em seguida, usar AdminSetUserPassword para alterar a senha
    try {
      // Primeiro, validar a senha atual fazendo login no Cognito
      await this.cognitoService.signIn(username, changePasswordDto.oldPassword);

      // Se o login foi bem-sucedido, alterar a senha usando AdminSetUserPassword
      await this.cognitoService.adminSetUserPassword(username, changePasswordDto.newPassword);
    } catch (error: any) {
      // Se o usuário não existe no Cognito, informar que precisa ser registrado lá primeiro
      if (error.name === 'UserNotFoundException' ||
          error.message?.includes('User does not exist') ||
          error.message?.includes('User not found')) {
        throw new UnauthorizedException('Usuário não encontrado no sistema de autenticação. É necessário registrar-se primeiro.');
      }

      if (error.name === 'NotAuthorizedException') {
        throw new UnauthorizedException('Senha atual incorreta');
      }

      // Se for erro de permissão IAM, informar que precisa configurar o Cognito
      if (error.name === 'UnrecognizedClientException' ||
          error.name === 'AccessDeniedException' ||
          error.message?.includes('security token') ||
          error.message?.includes('invalid')) {
        throw new UnauthorizedException('Erro de configuração do AWS Cognito. Entre em contato com o administrador.');
      }

      throw error;
    }
  }

}

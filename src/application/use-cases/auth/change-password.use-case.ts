import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ChangePasswordDto } from '../../dtos/auth/change-password.dto';
import { CognitoService } from '../../../infrastructure/services/cognito.service';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly cognitoService: CognitoService,
  ) {}

  async execute(
    changePasswordDto: ChangePasswordDto,
    accessToken: string,
  ): Promise<void> {
    try {
      await this.cognitoService.changePassword(
        accessToken,
        changePasswordDto.oldPassword,
        changePasswordDto.newPassword,
      );
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

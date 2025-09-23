import {
  Injectable,
  ConflictException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { RegisterUserDto } from '../../../application/dtos/auth/register-user.dto';
import { User } from '../../../domain/entities/user.entity';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import { CognitoService } from '../../../infrastructure/services/cognito.service';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly cognitoService: CognitoService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<{ user: User; confirmationRequired: boolean }> {
    // Verificar se o email já existe no nosso banco
    const existingUserByEmail = await this.userRepository.findByEmail(
      dto.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('Email já está em uso');
    }

    // Verificar se o username já existe no nosso banco
    const existingUserByUsername = await this.userRepository.findByUsername(
      dto.username,
    );
    if (existingUserByUsername) {
      throw new ConflictException('Nome de usuário já está em uso');
    }

    // Verificar se a senha está presente
    if (!dto.password) {
      throw new BadRequestException('Senha é obrigatória');
    }

    try {
      // 1. Registrar no AWS Cognito
      const cognitoResult = await this.cognitoService.signUp(
        dto.username,
        dto.password,
        dto.email,
      );

      // 2. Criar usuário no nosso banco (sem senha, pois está no Cognito)
      const user = new User();
      user.username = dto.username;
      user.email = dto.email;
      user.cognitoUserId = cognitoResult.userId; // Armazenar ID do Cognito
      user.isDependent = false; // Usuário registrado não é dependente por padrão
      user.status = UserStatus.PENDING_CONFIRMATION; // Aguardando confirmação

      // Salvar no repositório
      const savedUser = await this.userRepository.create(user);

      // Remover campos sensíveis do objeto retornado
      savedUser.password = undefined;

      return {
        user: savedUser,
        confirmationRequired: cognitoResult.confirmationRequired,
      };
    } catch (error: any) {
      // Se der erro no Cognito, verificar se é conflito
      if (error.name === 'UsernameExistsException') {
        throw new ConflictException('Nome de usuário já está em uso no sistema');
      }
      if (error.name === 'InvalidParameterException') {
        throw new BadRequestException('Dados inválidos fornecidos');
      }
      throw new BadRequestException(`Erro ao registrar usuário: ${error.message}`);
    }
  }
}

import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CognitoService } from '../../../infrastructure/services/cognito.service';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class ResendVerificationEmailUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly cognitoService: CognitoService,
  ) {}

  async execute(userId: string): Promise<{ message: string }> {
    // 1. Buscar o usuário no banco de dados (incluindo inativos, como no /me)
    const user = await this.userRepository.findByIdIncludingInactive(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // 2. Verificar se o usuário tem email
    if (!user.email) {
      throw new BadRequestException('Usuário não possui e-mail cadastrado');
    }

    // 3. Verificar se o e-mail já está verificado
    if (user.isEmailVerified) {
      throw new BadRequestException('E-mail já está verificado');
    }

    // 4. Reenviar código de confirmação via Cognito
    try {
      await this.cognitoService.resendConfirmationCode(user.email);

      return {
        message: 'Código de confirmação reenviado com sucesso',
      };
    } catch (error: any) {
      // Tratar erros específicos do Cognito
      if (error.name === 'LimitExceededException') {
        throw new BadRequestException(
          'Limite de tentativas excedido. Tente novamente mais tarde.',
        );
      }
      if (error.name === 'InvalidParameterException') {
        throw new BadRequestException('Parâmetros inválidos');
      }
      if (error.name === 'UserNotFoundException') {
        throw new NotFoundException(
          'Usuário não encontrado no sistema de autenticação',
        );
      }

      // Re-throw se for um erro já tratado pelo NestJS
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException(
        `Erro ao reenviar código de confirmação: ${error.message}`,
      );
    }
  }
}


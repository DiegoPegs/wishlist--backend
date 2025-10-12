import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfirmRegistrationDto } from '../../../application/dtos/auth/confirm-registration.dto';
import { User } from '../../../domain/entities/user.entity';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import { CognitoService } from '../../../infrastructure/services/cognito.service';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class ConfirmRegistrationUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly cognitoService: CognitoService,
  ) {}

  async execute(
    dto: ConfirmRegistrationDto,
  ): Promise<{ user: User; message: string }> {
    try {
      // 1. Confirmar registro no AWS Cognito
      await this.cognitoService.confirmSignUp(dto.username, dto.code);

      // 2. Buscar usuário no nosso banco MongoDB (incluindo usuários pendentes)
      const user = await this.userRepository.findByUsernameForAuth(
        dto.username,
      );
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      // 3. Verificar se o usuário já está ativo
      if (user.status === UserStatus.ACTIVE) {
        // Usuário já está ativo, apenas retornar sucesso
        user.password = undefined;
        return {
          user,
          message: 'Usuário já estava confirmado!',
        };
      }

      // 4. Verificar se o usuário está pendente de confirmação
      if (user.status !== UserStatus.PENDING_CONFIRMATION) {
        throw new BadRequestException(
          'Usuário está em estado inválido para confirmação',
        );
      }

      // 5. Atualizar status para ATIVO
      user.status = UserStatus.ACTIVE;
      const updatedUser = await this.userRepository.update(user._id!, user);

      if (!updatedUser) {
        throw new NotFoundException('Erro ao atualizar usuário');
      }

      // Remover campos sensíveis
      updatedUser.password = undefined;

      return {
        user: updatedUser,
        message: 'Registro confirmado com sucesso!',
      };
    } catch (error: any) {
      // Tratar erros específicos do Cognito
      if (error.name === 'CodeMismatchException') {
        throw new BadRequestException('Código de confirmação inválido');
      }
      if (error.name === 'ExpiredCodeException') {
        throw new BadRequestException('Código de confirmação expirado');
      }
      if (error.name === 'NotAuthorizedException') {
        // Usuário já foi confirmado no Cognito, mas pode não estar ativo no nosso banco
        // Vamos tentar ativar no nosso banco mesmo assim
        const user = await this.userRepository.findByUsernameForAuth(
          dto.username,
        );
        if (!user) {
          throw new NotFoundException('Usuário não encontrado');
        }

        if (user.status === UserStatus.ACTIVE) {
          user.password = undefined;
          return {
            user,
            message: 'Usuário já estava confirmado!',
          };
        }

        // Ativar usuário no nosso banco
        user.status = UserStatus.ACTIVE;
        const updatedUser = await this.userRepository.update(user._id!, user);

        if (!updatedUser) {
          throw new NotFoundException('Erro ao atualizar usuário');
        }

        updatedUser.password = undefined;
        return {
          user: updatedUser,
          message: 'Usuário confirmado com sucesso!',
        };
      }
      if (error.name === 'UserNotFoundException') {
        throw new NotFoundException('Usuário não encontrado no sistema');
      }
      if (error.name === 'InvalidParameterException') {
        throw new BadRequestException('Parâmetros inválidos fornecidos');
      }

      // Re-throw se for um erro já tratado pelo NestJS
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new BadRequestException(
        `Erro ao confirmar registro: ${error.message}`,
      );
    }
  }
}

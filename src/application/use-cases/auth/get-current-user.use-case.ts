import { Injectable, Inject, Logger } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { CognitoService } from '../../../infrastructure/services/cognito.service';

@Injectable()
export class GetCurrentUserUseCase {
  private readonly logger = new Logger(GetCurrentUserUseCase.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly cognitoService: CognitoService,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findByIdIncludingInactive(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar se o usuário está ativo
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('User is inactive');
    }

    // Se o nosso banco de dados acha que o usuário não está verificado,
    // vamos checar a fonte da verdade (Cognito) e sincronizar.
    if (user && !user.isEmailVerified && user.email) {
      try {
        const cognitoStatus =
          await this.cognitoService.getUserVerificationStatus(user.email);
        if (cognitoStatus === true) {
          // O usuário verificou o e-mail em outro lugar. Sincronize nosso banco.
          user.isEmailVerified = true;
          await this.userRepository.update(user._id!.toString(), user);
        }
      } catch (error) {
        // Loga o erro mas não impede o fluxo (pode ser que o usuário no Cognito esteja em um estado estranho)
        this.logger.warn(
          `Falha ao sincronizar status de verificação do Cognito para o usuário ${user.email}`,
          error,
        );
      }
    }

    // Buscar dependentes incluindo inativos
    if (user.dependents && user.dependents.length > 0) {
      const dependentIds = user.dependents.map((id) => id.toString());
      const dependents =
        await this.userRepository.findDependentsIncludingInactive(dependentIds);
      // Adicionar os objetos completos dos dependentes como uma propriedade dinâmica
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (user as any).dependentsData = dependents;
    }

    return user;
  }
}

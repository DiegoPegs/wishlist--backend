import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  InvitationStatus,
  UserStatus,
} from '../../../domain/enums/statuses.enum';
import type { IInvitationRepository } from '../../../domain/repositories/invitation.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Invitation } from 'src/domain/entities/invitation.entity';

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    @Inject('IInvitationRepository')
    private readonly invitationRepository: IInvitationRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    _token: string,
    _acceptingUserId: string,
  ): Promise<{ message: string }> {
    // Buscar o convite pelo token
    const invitation = await this.invitationRepository.findByToken(_token);
    if (!invitation) {
      throw new NotFoundException('Convite não encontrado');
    }

    // Validar o convite (status PENDING, não expirado)
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Convite já foi processado ou expirado');
    }

    if (invitation.expiresAt < new Date()) {
      // Atualizar status para expirado
      await this.invitationRepository.update(invitation._id!.toString(), {
        status: InvitationStatus.EXPIRED,
      });
      throw new BadRequestException('Convite expirado');
    }

    // Verificar se o usuário que está aceitando existe
    const acceptingUser = await this.userRepository.findById(_acceptingUserId);
    if (!acceptingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Extrair o dependentId do contexto do convite
    const dependentId = invitation.context.dependentId;

    // Verificar se o dependente existe (incluindo inativos)
    const dependent =
      await this.userRepository.findByIdIncludingInactive(dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // Verificar se o dependente está ativo
    if (dependent.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Dependente não está ativo');
    }

    // Executar transação para aceitar o convite
    await this.acceptInvitationTransaction(
      invitation,
      dependentId,
      _acceptingUserId,
    );

    return { message: 'Convite aceito com sucesso' };
  }

  private async acceptInvitationTransaction(
    invitation: Invitation,
    dependentId: string,
    acceptingUserId: string,
  ): Promise<void> {
    try {
      // 1. Adicionar o acceptingUserId ao array guardianIds do dependente
      const dependent =
        await this.userRepository.findByIdIncludingInactive(dependentId);
      if (dependent) {
        const guardianIds = dependent.guardianIds || [];
        if (!guardianIds.includes(acceptingUserId)) {
          guardianIds.push(acceptingUserId);
          await this.userRepository.update(dependentId, { guardianIds });
        }
      }

      // 2. Adicionar o dependentId ao array dependents do acceptingUserId
      const acceptingUser = await this.userRepository.findById(acceptingUserId);
      if (acceptingUser) {
        const dependents = acceptingUser.dependents || [];
        if (!dependents.includes(dependentId)) {
          dependents.push(dependentId);
          await this.userRepository.update(acceptingUserId, { dependents });
        }
      }

      // 3. Atualizar o status do convite para ACCEPTED
      await this.invitationRepository.update(invitation._id!.toString(), {
        status: InvitationStatus.ACCEPTED,
      });
    } catch (error: unknown) {
      // Em caso de erro, reverter as mudanças
      if (error instanceof Error) {
        throw new Error(`Erro ao aceitar convite: ${error.message}`);
      }
      // Verificar se é erro de duplicação do MongoDB (código 11000)
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new Error('Erro de duplicação: Convite já foi processado');
      }
      throw new Error('Erro desconhecido ao aceitar convite');
    }
  }
}

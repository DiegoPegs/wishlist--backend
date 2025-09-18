import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class AddGuardianUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dependentId: string,
    newGuardianId: string,
    currentGuardianId: string,
  ): Promise<void> {
    // a. Buscar os três usuários
    const [dependent, newGuardian, currentGuardian] = await Promise.all([
      this.userRepository.findByIdIncludingInactive(dependentId),
      this.userRepository.findByIdIncludingInactive(newGuardianId),
      this.userRepository.findByIdIncludingInactive(currentGuardianId),
    ]);

    // Validar se todos os usuários existem
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }
    if (!newGuardian) {
      throw new NotFoundException('Novo guardião não encontrado');
    }
    if (!currentGuardian) {
      throw new NotFoundException('Guardião atual não encontrado');
    }

    // b. Validar se o dependente está ativo
    if (dependent.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Dependente não está ativo');
    }

    // c. Validar se o solicitante é um guardião atual
    if (
      !dependent.guardianIds ||
      !dependent.guardianIds.includes(currentGuardianId)
    ) {
      throw new ForbiddenException('Você não é um guardião deste dependente');
    }

    // d. Validar se o novo guardião é seguido pelo guardião atual
    // Converter ObjectIds para strings para comparação
    const followingId = currentGuardian.following || [];

    if (!currentGuardian.following || !followingId.includes(newGuardianId)) {
      throw new BadRequestException(
        'Você deve seguir o novo guardião antes de adicioná-lo',
      );
    }

    // e. Validar se o novo guardião já não está na lista
    if (
      dependent.guardianIds &&
      dependent.guardianIds.includes(newGuardianId)
    ) {
      throw new BadRequestException(
        'Este guardião já está na lista de guardiões do dependente',
      );
    }

    // f. Executar a atualização dentro de uma transação
    await this.addGuardianTransaction(dependentId, newGuardianId);

    // g. Placeholder para futura notificação
    // TODO: Implementar sistema de notificações
  }

  private async addGuardianTransaction(
    dependentId: string,
    newGuardianId: string,
  ): Promise<void> {
    try {
      // Adicionar o novo guardião ao array guardianIds do dependente
      await this.userRepository.addGuardian(dependentId, newGuardianId);

      // Adicionar o dependente ao array dependents do novo guardião
      await this.userRepository.addDependent(newGuardianId, dependentId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Erro ao adicionar guardião: ${error.message}`);
      }
      // Verificar se é erro de duplicação do MongoDB (código 11000)
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new Error('Erro de duplicação: Relacionamento já existe');
      }
      throw new Error('Erro desconhecido ao adicionar guardião');
    }
  }
}

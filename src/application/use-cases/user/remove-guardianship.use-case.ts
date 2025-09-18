import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class RemoveGuardianshipUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dependentId: string, requesterId: string): Promise<void> {
    // a. Buscar o documento do dependente
    const dependent =
      await this.userRepository.findByIdIncludingInactive(dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // b. Validar se o requesterId é de fato um dos guardiões
    if (
      !dependent.guardianIds ||
      !dependent.guardianIds.includes(requesterId)
    ) {
      throw new ConflictException('Você não é um guardião deste dependente');
    }

    // c. Implementar a regra do "Último Guardião"
    if (dependent.guardianIds.length <= 1) {
      throw new ConflictException(
        'Não é possível remover o último guardião. O dependente deve ter pelo menos um guardião.',
      );
    }

    // d. Iniciar transação para remover o guardião
    await this.removeGuardianshipTransaction(dependentId, requesterId);
  }

  private async removeGuardianshipTransaction(
    dependentId: string,
    requesterId: string,
  ): Promise<void> {
    try {
      // Remover o requesterId do array guardianIds do dependente
      await this.userRepository.removeGuardian(dependentId, requesterId);

      // Remover o dependentId do array dependents do guardião
      await this.userRepository.removeDependent(requesterId, dependentId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Erro ao remover guardião: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao remover guardião');
    }
  }
}

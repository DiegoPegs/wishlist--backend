import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class DeactivateDependentUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    _dependentId: string,
    __requesterId: string,
  ): Promise<{ message: string }> {
    // Buscar o dependente pelo dependentId
    const dependent = await this.userRepository.findById(_dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // Validar se o _requesterId está no array guardianIds do dependente
    if (!dependent.guardianIds?.includes(__requesterId)) {
      throw new ForbiddenException(
        'Você não tem permissão para desativar este dependente',
      );
    }

    // Executar transação para desativar o dependente
    await this.deactivateDependentTransaction(_dependentId, __requesterId);

    return { message: 'Dependente desativado com sucesso' };
  }

  private async deactivateDependentTransaction(
    _dependentId: string,
    _requesterId: string,
  ): Promise<void> {
    try {
      // Atualizar o status do dependente para 'INACTIVE'
      await this.userRepository.update(_dependentId, {
        status: UserStatus.INACTIVE,
      });
    } catch (error: unknown) {
      // Em caso de erro, relançar o erro
      if (error instanceof Error) {
        throw new Error(`Erro ao desativar dependente: ${error.message}`);
      }
      // Verificar se é erro de duplicação do MongoDB (código 11000)
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new Error('Erro de duplicação: Operação não pode ser executada');
      }
      throw new Error('Erro desconhecido ao desativar dependente');
    }
  }
}

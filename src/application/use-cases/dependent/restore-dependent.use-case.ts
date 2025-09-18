import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class RestoreDependentUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    _dependentId: string,
    __requesterId: string,
  ): Promise<{ message: string }> {
    // Buscar o dependente pelo dependentId (incluindo usuários inativos)
    const dependent =
      await this.userRepository.findByIdIncludingInactive(_dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // Validar se o dependente está inativo
    if (dependent.status !== UserStatus.INACTIVE) {
      throw new BadRequestException('Este dependente não está desativado');
    }

    // Validar se o _requesterId está no array guardianIds do dependente
    if (!dependent.guardianIds?.includes(__requesterId)) {
      throw new ForbiddenException(
        'Você não tem permissão para restaurar este dependente',
      );
    }

    // Executar transação para restaurar o dependente
    await this.restoreDependentTransaction(_dependentId, __requesterId);

    return { message: 'Dependente restaurado com sucesso' };
  }

  private async restoreDependentTransaction(
    _dependentId: string,
    _requesterId: string,
  ): Promise<void> {
    try {
      // Atualizar o status do dependente para 'ACTIVE'
      await this.userRepository.update(_dependentId, {
        status: UserStatus.ACTIVE,
      });
    } catch (error: unknown) {
      // Em caso de erro, relançar o erro
      if (error instanceof Error) {
        throw new Error(`Erro ao restaurar dependente: ${error.message}`);
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
      throw new Error('Erro desconhecido ao restaurar dependente');
    }
  }
}

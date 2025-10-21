import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class FindDependentByIdUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dependentId: string,
    requesterId: string,
  ): Promise<User> {
    // Buscar o dependente (incluindo inativos)
    const dependent = await this.userRepository.findByIdIncludingInactive(dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // Validar se o requesterId é um dos guardiões do dependente
    if (
      !dependent.guardianIds ||
      !dependent.guardianIds.includes(requesterId)
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar os detalhes deste dependente',
      );
    }

    return dependent;
  }
}

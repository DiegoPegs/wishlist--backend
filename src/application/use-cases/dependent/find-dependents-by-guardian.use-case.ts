import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class FindDependentsByGuardianUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    guardianId: string,
    status?: 'ACTIVE' | 'INACTIVE',
  ): Promise<User[]> {
    // Buscar o guardião (incluindo inativos)
    const guardian =
      await this.userRepository.findByIdIncludingInactive(guardianId);
    if (!guardian) {
      throw new NotFoundException('Guardião não encontrado');
    }

    // Verificar se o guardião tem dependentes
    if (!guardian.dependents || guardian.dependents.length === 0) {
      return [];
    }

    // Buscar os dependentes
    const dependentIds = guardian.dependents.map((id) => id.toString());
    let dependents: User[];

    if (status) {
      // Se status foi especificado, buscar todos e filtrar
      dependents =
        await this.userRepository.findDependentsIncludingInactive(dependentIds);
      return dependents.filter((dependent) => dependent.status === status);
    } else {
      // Se status não foi especificado, buscar todos (incluindo inativos)
      return await this.userRepository.findDependentsIncludingInactive(
        dependentIds,
      );
    }
  }
}

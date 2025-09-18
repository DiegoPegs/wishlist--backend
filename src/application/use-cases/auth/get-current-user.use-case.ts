import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
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

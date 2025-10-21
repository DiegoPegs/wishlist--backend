import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import { NotificationType } from '../../../domain/entities/notification.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import { CreateNotificationUseCase } from '../notification/create-notification.use-case';

@Injectable()
export class PermanentlyDeleteDependentUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  async execute(
    requestingUserId: string,
    dependentId: string,
  ): Promise<{ message: string }> {
    // Buscar o dependente incluindo usuários inativos
    const dependent =
      await this.userRepository.findByIdIncludingInactive(dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // Verificar se o requestingUserId é o guardianId do dependente
    if (!dependent.guardianIds?.includes(requestingUserId)) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir permanentemente este dependente',
      );
    }

    // Buscar todas as wishlists do dependente
    const wishlists =
      await this.wishlistRepository.findByUserId(dependentId);

    // Iterar sobre as wishlists e chamar wishlistRepository.delete() para cada uma
    // (confiando no middleware pre('remove') para os itens)
    for (const wishlist of wishlists) {
      if (!wishlist._id) continue;
      await this.wishlistRepository.delete(wishlist._id.toString());
    }

    // Verificar se o dependente tem um secondGuardianId
    const secondGuardianId = dependent.guardianIds?.find(
      (id) => id !== requestingUserId,
    );

    // Se tiver, chamar o CreateNotificationUseCase para registrar uma notificação
    if (secondGuardianId) {
      await this.createNotificationUseCase.execute(
        secondGuardianId,
        NotificationType.DEPENDENT_DELETED,
        {
          dependentName: dependent.name,
          deletedByGuardianId: requestingUserId,
        },
      );
    }

    // Remover referências do dependente nos guardiões
    if (dependent.guardianIds) {
      for (const guardianId of dependent.guardianIds) {
        await this.userRepository.removeDependent(guardianId, dependentId);
      }
    }

    // Finalmente, deletar o próprio documento do dependente
    await this.userRepository.delete(dependentId);

    return { message: 'Dependente excluído permanentemente com sucesso' };
  }
}

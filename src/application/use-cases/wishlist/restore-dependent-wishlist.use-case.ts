import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { WishlistStatus } from '../../../domain/enums/statuses.enum';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class RestoreDependentWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dependentId: string,
    wishlistId: string,
    requesterId: string,
  ): Promise<{ message: string }> {
    // 1. Verificar se o dependente existe (incluindo inativos)
    const dependent = await this.userRepository.findByIdIncludingInactive(dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // 2. Verificar se o requesterId é um dos guardiões do dependente
    if (
      !dependent.guardianIds ||
      !dependent.guardianIds.includes(requesterId)
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para restaurar wishlists deste dependente',
      );
    }

    // 3. Buscar a wishlist
    const wishlist = await this.wishlistRepository.findById(wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Wishlist não encontrada');
    }

    // 4. Verificar se a wishlist pertence ao dependente
    if (wishlist.userId !== dependentId) {
      throw new NotFoundException('Wishlist não encontrada');
    }

    // 5. Verificar se a wishlist está arquivada
    if (wishlist.status !== WishlistStatus.ARCHIVED) {
      throw new ForbiddenException('Wishlist não está arquivada');
    }

    // 6. Restaurar a wishlist
    await this.wishlistRepository.update(wishlistId, {
      status: WishlistStatus.ACTIVE,
      archivedAt: undefined,
    });

    return { message: 'Wishlist restaurada com sucesso' };
  }
}

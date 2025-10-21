import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateWishlistDto } from '../../dtos/wishlist/update-wishlist.dto';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { Wishlist } from '../../../domain/entities/wishlist.entity';

@Injectable()
export class UpdateDependentWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dependentId: string,
    wishlistId: string,
    updateWishlistDto: UpdateWishlistDto,
    requesterId: string,
  ): Promise<Wishlist> {
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
        'Você não tem permissão para atualizar wishlists deste dependente',
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

    // 5. Atualizar a wishlist
    const updatedWishlist = await this.wishlistRepository.update(wishlistId, updateWishlistDto);
    if (!updatedWishlist) {
      throw new Error('Failed to update wishlist');
    }

    return updatedWishlist;
  }
}

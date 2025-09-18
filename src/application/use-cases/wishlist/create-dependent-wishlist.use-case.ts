import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { CreateDependentWishlistDto } from '../../dtos/wishlist/create-dependent-wishlist.dto';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { WishlistStatus } from '../../../domain/enums/statuses.enum';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class CreateDependentWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dto: CreateDependentWishlistDto,
    dependentId: string,
    requesterId: string,
  ): Promise<Wishlist> {
    // Buscar o perfil do dependente
    const dependent = await this.userRepository.findById(dependentId);
    if (!dependent) {
      throw new ForbiddenException('Dependent not found');
    }

    // Validar se o requesterId é um dos guardiões do dependente
    if (
      !dependent.guardianIds ||
      !dependent.guardianIds.includes(requesterId)
    ) {
      throw new ForbiddenException(
        'You are not authorized to create wishlists for this dependent',
      );
    }

    // Criar e salvar uma nova Wishlist, associando o userId da lista ao dependentId
    const wishlist = new Wishlist();
    wishlist.userId = dependentId;
    wishlist.title = dto.title;
    wishlist.description = dto.description;
    wishlist.sharing = {
      isPublic: false,
      publicLinkToken: undefined,
    };
    wishlist.status = WishlistStatus.ACTIVE;
    wishlist.archivedAt = undefined;

    return await this.wishlistRepository.create(wishlist);
  }
}

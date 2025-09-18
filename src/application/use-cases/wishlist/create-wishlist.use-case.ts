import { Injectable, Inject } from '@nestjs/common';
import { CreateWishlistDto } from '../../dtos/wishlist/create-wishlist.dto';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { WishlistStatus } from '../../../domain/enums/statuses.enum';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class CreateWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(
    createWishlistDto: CreateWishlistDto,
    _userId: string,
  ): Promise<Wishlist> {
    const wishlist = new Wishlist();
    wishlist.userId = _userId;
    wishlist.title = createWishlistDto.title;
    wishlist.description = createWishlistDto.description;
    wishlist.sharing = {
      isPublic: false,
      publicLinkToken: undefined,
    };
    wishlist.status = WishlistStatus.ACTIVE;
    wishlist.archivedAt = undefined;

    return await this.wishlistRepository.create(wishlist);
  }
}

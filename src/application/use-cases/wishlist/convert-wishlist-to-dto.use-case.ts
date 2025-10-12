import { Injectable } from '@nestjs/common';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { WishlistWithLinkDto } from '../../dtos/wishlist/wishlist-with-link.dto';

@Injectable()
export class ConvertWishlistToDtoUseCase {
  execute(wishlist: Wishlist): WishlistWithLinkDto {
    const sharing = {
      ...wishlist.sharing,
      publicLink:
        wishlist.sharing.isPublic && wishlist.sharing.publicLinkToken
          ? `${process.env.FRONTEND_URL}/public/${wishlist.sharing.publicLinkToken}`
          : undefined,
    };

    return {
      _id: wishlist._id,
      userId: wishlist.userId,
      title: wishlist.title,
      description: wishlist.description,
      sharing,
      status: wishlist.status,
      archivedAt: wishlist.archivedAt,
    };
  }
}

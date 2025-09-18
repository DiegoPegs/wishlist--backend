import { Injectable, Inject } from '@nestjs/common';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class GetUserWishlistsUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(_userId: string): Promise<Wishlist[]> {
    return this.wishlistRepository.findByUserId(_userId);
  }
}

import { Injectable } from '@nestjs/common';
import { PublicWishlistDto } from '../../../application/dtos/public/public-wishlist.dto';
import { GetPublicWishlistUseCase } from '../../../application/use-cases/wishlist/get-public-wishlist.use-case';

@Injectable()
export class PublicService {
  constructor(
    private readonly getPublicWishlistUseCase: GetPublicWishlistUseCase,
  ) {}

  async getPublicWishlist(publicLinkToken: string): Promise<PublicWishlistDto> {
    return await this.getPublicWishlistUseCase.execute(publicLinkToken);
  }
}

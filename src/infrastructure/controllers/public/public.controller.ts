import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PublicWishlistDto } from '../../../application/dtos/public/public-wishlist.dto';
import { PublicService } from './public.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Public()
  @Get('wishlists/:token')
  @HttpCode(HttpStatus.OK)
  async getPublicWishlist(
    @Param('token') publicLinkToken: string,
  ): Promise<PublicWishlistDto> {
    return await this.publicService.getPublicWishlist(publicLinkToken);
  }
}

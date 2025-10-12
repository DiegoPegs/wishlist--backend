import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PublicWishlistDto } from '../../../application/dtos/public/public-wishlist.dto';
import { PublicService } from './public.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Public()
  @Get('wishlists/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obter wishlist pública',
    description:
      'Retorna uma wishlist pública usando o token de link compartilhado',
  })
  @ApiParam({
    name: 'token',
    description: 'Token de link público da wishlist',
    example: 'abc123def456ghi789',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist pública obtida com sucesso',
    type: PublicWishlistDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Wishlist não encontrada ou token inválido',
  })
  async getPublicWishlist(
    @Param('token') publicLinkToken: string,
  ): Promise<PublicWishlistDto> {
    return await this.publicService.getPublicWishlist(publicLinkToken);
  }
}

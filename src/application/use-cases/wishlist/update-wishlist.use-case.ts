import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { UpdateWishlistDto } from '../../dtos/wishlist/update-wishlist.dto';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { WishlistWithLinkDto } from '../../dtos/wishlist/wishlist-with-link.dto';
import { ConvertWishlistToDtoUseCase } from './convert-wishlist-to-dto.use-case';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class UpdateWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    private readonly convertWishlistToDtoUseCase: ConvertWishlistToDtoUseCase,
  ) {}

  async execute(
    wishlistId: string,
    dto: UpdateWishlistDto,
    requesterId: string,
  ): Promise<WishlistWithLinkDto> {
    // a. Buscar a wishlist pelo wishlistId
    const wishlist = await this.wishlistRepository.findById(wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    // b. Validar se o requesterId é o dono da wishlist
    if (wishlist.userId.toString() !== requesterId) {
      throw new ForbiddenException('You can only update your own wishlists');
    }

    // c. Atualizar a wishlist com os dados do DTO e salvá-la
    const updateData: Partial<Wishlist> = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    const updatedWishlist = await this.wishlistRepository.update(
      wishlistId,
      updateData,
    );
    if (!updatedWishlist) {
      throw new NotFoundException('Failed to update wishlist');
    }

    return this.convertWishlistToDtoUseCase.execute(updatedWishlist);
  }
}

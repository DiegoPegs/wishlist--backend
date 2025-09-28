import { Injectable } from '@nestjs/common';
import { CreateWishlistDto } from '../../../application/dtos/wishlist/create-wishlist.dto';
import { CreateItemDto } from '../../../application/dtos/item/create-item.dto';
import { UpdateWishlistSharingDto } from '../../../application/dtos/wishlist/update-wishlist-sharing.dto';
import { UpdateWishlistDto } from '../../../application/dtos/wishlist/update-wishlist.dto';
import { CreateWishlistUseCase } from '../../../application/use-cases/wishlist/create-wishlist.use-case';
import { GetUserWishlistsUseCase } from '../../../application/use-cases/wishlist/get-user-wishlists.use-case';
import { GetWishlistByIdUseCase } from '../../../application/use-cases/wishlist/get-wishlist-by-id.use-case';
import { FindWishlistByIdUseCase } from '../../../application/use-cases/wishlist/find-wishlist-by-id.use-case';
import { SoftDeleteWishlistUseCase } from '../../../application/use-cases/wishlist/soft-delete-wishlist.use-case';
import { RestoreWishlistUseCase } from '../../../application/use-cases/wishlist/restore-wishlist.use-case';
import { HardDeleteWishlistUseCase } from '../../../application/use-cases/wishlist/hard-delete-wishlist.use-case';
import { CreateItemUseCase } from '../../../application/use-cases/item/create-item.use-case';
import { UpdateWishlistSharingUseCase } from '../../../application/use-cases/wishlist/update-wishlist-sharing.use-case';
import { UpdateWishlistUseCase } from '../../../application/use-cases/wishlist/update-wishlist.use-case';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { Item } from '../../../domain/entities/item.entity';
import { WishlistWithItemsDto } from '../../../application/dtos/wishlist/wishlist-with-items.dto';
import { WishlistWithItemsResponseDto } from '../../../application/dtos/wishlist/wishlist-with-items-response.dto';

@Injectable()
export class WishlistsService {
  constructor(
    private readonly createWishlistUseCase: CreateWishlistUseCase,
    private readonly getUserWishlistsUseCase: GetUserWishlistsUseCase,
    private readonly getWishlistByIdUseCase: GetWishlistByIdUseCase,
    private readonly findWishlistByIdUseCase: FindWishlistByIdUseCase,
    private readonly softDeleteWishlistUseCase: SoftDeleteWishlistUseCase,
    private readonly restoreWishlistUseCase: RestoreWishlistUseCase,
    private readonly hardDeleteWishlistUseCase: HardDeleteWishlistUseCase,
    private readonly createItemUseCase: CreateItemUseCase,
    private readonly updateWishlistSharingUseCase: UpdateWishlistSharingUseCase,
    private readonly updateWishlistUseCase: UpdateWishlistUseCase,
  ) {}

  async createWishlist(
    createWishlistDto: CreateWishlistDto,
    _userId: string,
  ): Promise<Wishlist> {
    return this.createWishlistUseCase.execute(createWishlistDto, _userId);
  }

  async getUserWishlists(_userId: string): Promise<WishlistWithItemsResponseDto[]> {
    return this.getUserWishlistsUseCase.execute(_userId);
  }

  async getWishlistById(
    _wishlistId: string,
    _userId: string,
  ): Promise<Wishlist> {
    return this.getWishlistByIdUseCase.execute(_wishlistId, _userId);
  }

  async findWishlistByIdWithItems(
    _wishlistId: string,
    _userId: string,
  ): Promise<WishlistWithItemsDto> {
    return this.findWishlistByIdUseCase.execute(_wishlistId, _userId);
  }

  async createItem(
    createItemDto: CreateItemDto,
    _wishlistId: string,
    _userId: string,
  ): Promise<Item> {
    return this.createItemUseCase.execute(createItemDto, _wishlistId, _userId);
  }

  async archiveWishlist(
    _wishlistId: string,
    _userId: string,
  ): Promise<{ message: string }> {
    return this.softDeleteWishlistUseCase.execute(_wishlistId, _userId);
  }

  async restoreWishlist(
    _wishlistId: string,
    _userId: string,
  ): Promise<{ message: string }> {
    return this.restoreWishlistUseCase.execute(_wishlistId, _userId);
  }

  async permanentlyDeleteWishlist(
    _wishlistId: string,
    _userId: string,
  ): Promise<{ message: string }> {
    return this.hardDeleteWishlistUseCase.execute(_wishlistId, _userId);
  }

  async updateWishlistSharing(
    wishlistId: string,
    updateWishlistSharingDto: UpdateWishlistSharingDto,
    requesterId: string,
  ): Promise<{
    isPublic: boolean;
    publicLinkToken?: string;
    publicUrl?: string;
  }> {
    return this.updateWishlistSharingUseCase.execute(
      wishlistId,
      updateWishlistSharingDto,
      requesterId,
    );
  }

  async updateWishlist(
    wishlistId: string,
    updateWishlistDto: UpdateWishlistDto,
    requesterId: string,
  ): Promise<Wishlist> {
    return this.updateWishlistUseCase.execute(wishlistId, updateWishlistDto, requesterId);
  }
}

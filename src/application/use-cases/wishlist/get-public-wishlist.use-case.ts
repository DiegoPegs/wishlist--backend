import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { PublicWishlistDto } from '../../dtos/public/public-wishlist.dto';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class GetPublicWishlistUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IItemRepository') private readonly itemRepository: IItemRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(publicLinkToken: string): Promise<PublicWishlistDto> {
    // Buscar a wishlist pelo token público
    const wishlist =
      await this.wishlistRepository.findByPublicLinkToken(publicLinkToken);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found or not public');
    }

    // Verificar se a wishlist é pública
    if (!wishlist.sharing.isPublic) {
      throw new ForbiddenException('This wishlist is not public');
    }

    // Buscar os itens da wishlist
    const items = await this.itemRepository.findByWishlistId(
      wishlist._id.toString(),
    );

    // Buscar dados do usuário dono da wishlist
    const user = await this.userRepository.findById(wishlist.userId);
    const ownerName = user?.name;

    // Retornar versão pública da wishlist
    return new PublicWishlistDto(wishlist, items, ownerName);
  }
}

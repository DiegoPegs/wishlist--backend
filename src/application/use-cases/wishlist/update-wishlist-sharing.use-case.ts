import { Injectable, NotFoundException, UnauthorizedException, Inject } from '@nestjs/common';
import { UpdateWishlistSharingDto } from '../../dtos/wishlist/update-wishlist-sharing.dto';
import { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class UpdateWishlistSharingUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(
    wishlistId: string,
    dto: UpdateWishlistSharingDto,
    requesterId: string,
  ): Promise<{
    isPublic: boolean;
    publicLinkToken?: string;
    publicUrl?: string;
  }> {
    // a. Validar se o requesterId é o dono da wishlist
    const wishlist = await this.wishlistRepository.findById(wishlistId);

    if (!wishlist) {
      throw new NotFoundException('Wishlist não encontrada');
    }

    if (wishlist.userId !== requesterId) {
      throw new UnauthorizedException('Você não tem permissão para alterar esta wishlist');
    }

    // b. Verificar se a intenção é tornar a lista pública e se ainda não possui token
    let publicLinkToken = wishlist.sharing.publicLinkToken;

    if (dto.isPublic === true && !publicLinkToken) {
      publicLinkToken = randomUUID();
    }

    // c. Atualizar o status de compartilhamento e o token
    const updatedWishlist = await this.wishlistRepository.update(wishlistId, {
      sharing: {
        isPublic: dto.isPublic,
        publicLinkToken: dto.isPublic ? publicLinkToken : undefined,
      },
    });

    if (!updatedWishlist) {
      throw new NotFoundException('Erro ao atualizar wishlist');
    }

    // d. Construir resposta com URL pública se a lista for pública
    const result: {
      isPublic: boolean;
      publicLinkToken?: string;
      publicUrl?: string;
    } = {
      isPublic: updatedWishlist.sharing.isPublic,
      publicLinkToken: updatedWishlist.sharing.publicLinkToken,
    };

    // Incluir URL pública somente se a lista for pública
    if (result.isPublic && result.publicLinkToken) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      result.publicUrl = `${frontendUrl}/public/${result.publicLinkToken}`;
    }

    return result;
  }

}

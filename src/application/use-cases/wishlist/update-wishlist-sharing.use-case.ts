import { Injectable, NotFoundException, UnauthorizedException, Inject } from '@nestjs/common';
import { UpdateWishlistSharingDto } from '../../dtos/wishlist/update-wishlist-sharing.dto';
import { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import * as crypto from 'crypto';

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

    // b. Se dto.isPublic for true, gerar um publicLinkToken (se ainda não existir)
    let publicLinkToken = wishlist.sharing.publicLinkToken;

    if (dto.isPublic && !publicLinkToken) {
      publicLinkToken = this.generatePublicLinkToken();
    }

    // c. Atualizar o status de compartilhamento
    const updatedWishlist = await this.wishlistRepository.update(wishlistId, {
      sharing: {
        isPublic: dto.isPublic,
        publicLinkToken: dto.isPublic ? publicLinkToken : undefined,
      },
    });

    if (!updatedWishlist) {
      throw new NotFoundException('Erro ao atualizar wishlist');
    }

    // d. Retornar o novo estado de compartilhamento e o link público
    const result: {
      isPublic: boolean;
      publicLinkToken?: string;
      publicUrl?: string;
    } = {
      isPublic: updatedWishlist.sharing.isPublic,
      publicLinkToken: updatedWishlist.sharing.publicLinkToken,
    };

    // Adicionar URL pública se a wishlist for pública
    if (result.isPublic && result.publicLinkToken) {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      result.publicUrl = `${baseUrl}/public/wishlists/${result.publicLinkToken}`;
    }

    return result;
  }

  private generatePublicLinkToken(): string {
    // Gerar um token único e seguro para o link público
    return crypto.randomBytes(32).toString('hex');
  }
}

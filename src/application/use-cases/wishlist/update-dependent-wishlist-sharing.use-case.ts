import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateWishlistSharingDto } from '../../dtos/wishlist/update-wishlist-sharing.dto';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class UpdateDependentWishlistSharingUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    dependentId: string,
    wishlistId: string,
    dto: UpdateWishlistSharingDto,
    requesterId: string,
  ): Promise<{
    isPublic: boolean;
    publicLinkToken?: string;
    publicUrl?: string;
  }> {
    // 1. Verificar se o dependente existe (incluindo inativos)
    const dependent = await this.userRepository.findByIdIncludingInactive(dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // 2. Verificar se o requesterId é um dos guardiões do dependente
    if (
      !dependent.guardianIds ||
      !dependent.guardianIds.includes(requesterId)
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar wishlists deste dependente',
      );
    }

    // 3. Buscar a wishlist
    const wishlist = await this.wishlistRepository.findById(wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Wishlist não encontrada');
    }

    // 4. Verificar se a wishlist pertence ao dependente
    if (wishlist.userId !== dependentId) {
      throw new ForbiddenException(
        'Esta wishlist não pertence ao dependente especificado',
      );
    }

    // 5. Verificar se a intenção é tornar a lista pública e se ainda não possui token
    let publicLinkToken = wishlist.sharing.publicLinkToken;

    if (dto.isPublic === true && !publicLinkToken) {
      publicLinkToken = randomUUID();
    }

    // 6. Atualizar o status de compartilhamento e o token
    const updatedWishlist = await this.wishlistRepository.update(wishlistId, {
      sharing: {
        isPublic: dto.isPublic,
        publicLinkToken: dto.isPublic ? publicLinkToken : undefined,
      },
    });

    if (!updatedWishlist) {
      throw new NotFoundException('Erro ao atualizar wishlist');
    }

    // 7. Construir resposta com URL pública se a lista for pública
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

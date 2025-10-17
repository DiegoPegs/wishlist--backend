import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';

@Injectable()
export class FindDependentWishlistsUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(
    dependentId: string,
    requesterId: string,
  ): Promise<Wishlist[]> {
    // Buscar o dependente para validar permissões
    const dependent = await this.userRepository.findById(dependentId);
    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado');
    }

    // Validar se o requesterId é um dos guardiões do dependente
    if (
      !dependent.guardianIds ||
      !dependent.guardianIds.includes(requesterId)
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar as wishlists deste dependente',
      );
    }

    // Buscar todas as wishlists associadas ao dependentId
    const wishlists = await this.wishlistRepository.findByUserId(dependentId);

    // Se nenhuma lista for encontrada, retornar array vazio
    if (!wishlists || wishlists.length === 0) {
      return [];
    }

    return wishlists;
  }
}
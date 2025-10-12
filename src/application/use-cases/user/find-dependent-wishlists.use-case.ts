import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
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
    // a. Buscar o perfil do dependente e validar se o requesterId é um dos guardiões
    const dependent = await this.userRepository.findById(dependentId);
    if (!dependent) {
      throw new ForbiddenException('Dependente não encontrado');
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

    // b. Usar o IWishlistRepository para buscar todas as wishlists onde o userId corresponde ao dependentId
    const wishlists = await this.wishlistRepository.findByUserId(dependentId);

    // c. Importante: Se nenhuma lista for encontrada, retornar um array vazio ([]) para evitar erros 404 no futuro
    if (!wishlists || wishlists.length === 0) {
      return [];
    }

    return wishlists;
  }
}

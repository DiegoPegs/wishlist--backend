/**
 * Este caso de uso deve ser chamado por uma tarefa agendada (Cron Job) via AWS Lambda e EventBridge.
 *
 * A tarefa deve ser executada diariamente para limpar wishlists arquivadas há mais de 30 dias.
 *
 * Configuração sugerida no EventBridge:
 * - Rule: "purge-archived-wishlists"
 * - Schedule: "cron(0 2 * * ? *)" (executa todos os dias às 2:00 UTC)
 * - Target: Lambda function que chama este caso de uso
 */

import { Injectable, Inject } from '@nestjs/common';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import { HardDeleteWishlistUseCase } from './hard-delete-wishlist.use-case';

@Injectable()
export class PurgeArchivedWishlistsUseCase {
  constructor(
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    private readonly hardDeleteWishlistUseCase: HardDeleteWishlistUseCase,
  ) {}

  async execute(): Promise<{
    purgedCount: number;
    _purgedWishlistIds: string[];
    _errors: string[];
  }> {
    const _purgedWishlistIds: string[] = [];
    const _errors: string[] = [];

    try {
      // Calcular a data limite (30 dias atrás)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Buscar wishlists arquivadas há mais de 30 dias
      const archivedWishlists =
        await this.wishlistRepository.findArchivedBefore(thirtyDaysAgo);

      // Para cada wishlist encontrada, executar hard delete
      for (const wishlist of archivedWishlists) {
        try {
          // Usar o userId como requesterId para o hard delete
          await this.hardDeleteWishlistUseCase.execute(
            wishlist._id.toString(),
            wishlist.userId.toString(),
          );

          _purgedWishlistIds.push(wishlist._id.toString());
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? `Failed to purge wishlist ${wishlist._id.toString()}: ${error.message}`
              : `Failed to purge wishlist ${wishlist._id.toString()}: Erro desconhecido`;
          _errors.push(errorMessage);
        }
      }

      return {
        purgedCount: _purgedWishlistIds.length,
        _purgedWishlistIds,
        _errors,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? `Failed to execute purge operation: ${error.message}`
          : 'Failed to execute purge operation: Erro desconhecido';
      _errors.push(errorMessage);

      return {
        purgedCount: _purgedWishlistIds.length,
        _purgedWishlistIds,
        _errors,
      };
    }
  }
}

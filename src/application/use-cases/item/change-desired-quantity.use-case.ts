import {
  Injectable,
  Inject,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import { ChangeDesiredQuantityDto } from '../../dtos/item/change-desired-quantity.dto';
import { Item } from '../../../domain/entities/item.entity';

@Injectable()
export class ChangeDesiredQuantityUseCase {
  constructor(
    @Inject('IItemRepository') private readonly itemRepository: IItemRepository,
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
  ) {}

  async execute(
    itemId: string,
    dto: ChangeDesiredQuantityDto,
    requesterId: string,
  ): Promise<Item> {
    // 1. Buscar o item
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }

    // 2. Buscar a wishlist para validar permissão
    const wishlist = await this.wishlistRepository.findById(
      item.wishlistId.toString(),
    );
    if (!wishlist) {
      throw new NotFoundException('Wishlist não encontrada');
    }

    // 3. Validar se o usuário é o dono da wishlist
    if (wishlist.userId.toString() !== requesterId) {
      throw new UnauthorizedException(
        'Você não tem permissão para alterar este item',
      );
    }

    // 4. Validar se a nova quantidade é diferente da atual
    if (dto.desired === item.quantity?.desired) {
      throw new BadRequestException(
        'A nova quantidade deve ser diferente da quantidade atual',
      );
    }

    // 5. Se a nova quantidade for menor que a já reservada, iniciar fluxo de cancelamento
    if (dto.desired < (item.quantity?.reserved || 0)) {
      // Iniciar transação para cancelar reservas mais antigas
      return await this.handleQuantityReduction(item, dto.desired);
    }

    // 6. Se a nova quantidade for maior ou igual, apenas atualizar
    const updatedItem = await this.itemRepository.update(itemId, {
      quantity: {
        desired: dto.desired,
        reserved: item.quantity?.reserved || 0,
        received: item.quantity?.received || 0,
      },
    });

    if (!updatedItem) {
      throw new NotFoundException('Erro ao atualizar a quantidade do item');
    }

    return updatedItem;
  }

  private async handleQuantityReduction(
    item: Item,
    newDesired: number,
  ): Promise<Item> {
    // TODO: Implementar lógica complexa de cancelamento de reservas
    // Por enquanto, apenas atualizamos a quantidade
    // Em uma implementação completa, aqui seria necessário:
    // 1. Buscar todas as reservas do item ordenadas por data de criação
    // 2. Calcular quantas reservas cancelar (item.reserved - newDesired)
    // 3. Cancelar as reservas mais antigas
    // 4. Notificar os usuários afetados
    // 5. Atualizar o item com a nova quantidade desejada

    const updatedItem = await this.itemRepository.update(item._id.toString(), {
      quantity: {
        desired: newDesired,
        reserved: item.quantity?.reserved || 0,
        received: item.quantity?.received || 0,
      },
    });

    if (!updatedItem) {
      throw new NotFoundException('Erro ao atualizar a quantidade do item');
    }

    return updatedItem;
  }
}

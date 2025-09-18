import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';
import type { IConversationRepository } from '../../../domain/repositories/conversation.repository.interface';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import type { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';

@Injectable()
export class StartConversationUseCase {
  constructor(
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
    @Inject('IItemRepository') private readonly itemRepository: IItemRepository,
    @Inject('IWishlistRepository')
    private readonly wishlistRepository: IWishlistRepository,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async execute(itemId: string, userId: string): Promise<Conversation> {
    // Buscar o item
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Buscar a wishlist para verificar o dono
    const wishlist = await this.wishlistRepository.findById(item.wishlistId);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    // Verificar se o usuário não é o dono da wishlist
    if (wishlist.userId.toString() === userId) {
      throw new ForbiddenException(
        'You cannot start a conversation about your own item',
      );
    }

    // Buscar reservas ativas do item
    const reservations = await this.reservationRepository.findByItemId(itemId);
    const activeReservation = reservations.find(
      (r) =>
        r.status === ReservationStatus.RESERVED ||
        r.status === ReservationStatus.PURCHASED,
    );

    if (!activeReservation) {
      throw new ForbiddenException('No active reservation found for this item');
    }

    // Verificar se o usuário não é quem reservou o item
    if (activeReservation.reservedByUserId === userId) {
      throw new ForbiddenException(
        'You cannot start a conversation about an item you reserved',
      );
    }

    // Verificar se já existe uma conversa para este item
    const existingConversation =
      await this.conversationRepository.findByItemIdAndParticipants(itemId, [
        userId,
        activeReservation.reservedByUserId,
      ]);

    if (existingConversation) {
      throw new ConflictException('Conversation already exists for this item');
    }

    // Criar nova conversa
    const conversation = new Conversation();
    conversation.itemId = item._id.toString();
    conversation.participants = [
      userId,
      activeReservation.reservedByUserId.toString(),
    ];

    return await this.conversationRepository.create(conversation);
  }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { StartConversationUseCase } from '../../../application/use-cases/conversation/start-conversation.use-case';
import { GetConversationMessagesUseCase } from '../../../application/use-cases/conversation/get-conversation-messages.use-case';
import { SendMessageUseCase } from '../../../application/use-cases/conversation/send-message.use-case';
import { MongoConversationRepository } from '../../database/repositories/mongo.conversation.repository';
import { MongoMessageRepository } from '../../database/repositories/mongo.message.repository';
import { MongoItemRepository } from '../../database/repositories/mongo.item.repository';
import { MongoWishlistRepository } from '../../database/repositories/mongo.wishlist.repository';
import { MongoReservationRepository } from '../../database/repositories/mongo.reservation.repository';
import {
  Conversation,
  ConversationSchema,
} from '../../database/schemas/conversation.schema';
import { Message, MessageSchema } from '../../database/schemas/message.schema';
import { Item, ItemSchema } from '../../database/schemas/item.schema';
import {
  Wishlist,
  WishlistSchema,
} from '../../database/schemas/wishlist.schema';
import {
  Reservation,
  ReservationSchema,
} from '../../database/schemas/reservation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [ConversationsController],
  providers: [
    ConversationsService,
    StartConversationUseCase,
    GetConversationMessagesUseCase,
    SendMessageUseCase,
    {
      provide: 'IConversationRepository',
      useClass: MongoConversationRepository,
    },
    {
      provide: 'IMessageRepository',
      useClass: MongoMessageRepository,
    },
    {
      provide: 'IItemRepository',
      useClass: MongoItemRepository,
    },
    {
      provide: 'IWishlistRepository',
      useClass: MongoWishlistRepository,
    },
    {
      provide: 'IReservationRepository',
      useClass: MongoReservationRepository,
    },
  ],
  exports: [ConversationsService],
})
export class ConversationsModule {}

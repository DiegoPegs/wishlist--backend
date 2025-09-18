import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { UpdateItemMetadataUseCase } from '../../../application/use-cases/item/update-item-metadata.use-case';
import { ChangeDesiredQuantityUseCase } from '../../../application/use-cases/item/change-desired-quantity.use-case';
import { MarkAsReceivedUseCase } from '../../../application/use-cases/item/mark-as-received.use-case';
import { HardDeleteItemUseCase } from '../../../application/use-cases/item/hard-delete-item.use-case';
import { MongoItemRepository } from '../../database/repositories/mongo.item.repository';
import { MongoWishlistRepository } from '../../database/repositories/mongo.wishlist.repository';
import { MongoReservationRepository } from '../../database/repositories/mongo.reservation.repository';
import { MongoConversationRepository } from '../../database/repositories/mongo.conversation.repository';
import { MongoMessageRepository } from '../../database/repositories/mongo.message.repository';
import { Item, ItemSchema } from '../../database/schemas/item.schema';
import {
  Wishlist,
  WishlistSchema,
} from '../../database/schemas/wishlist.schema';
import {
  Reservation,
  ReservationSchema,
} from '../../database/schemas/reservation.schema';
import {
  Conversation,
  ConversationSchema,
} from '../../database/schemas/conversation.schema';
import { Message, MessageSchema } from '../../database/schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [ItemsController],
  providers: [
    ItemsService,
    UpdateItemMetadataUseCase,
    ChangeDesiredQuantityUseCase,
    MarkAsReceivedUseCase,
    HardDeleteItemUseCase,
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
    {
      provide: 'IConversationRepository',
      useClass: MongoConversationRepository,
    },
    {
      provide: 'IMessageRepository',
      useClass: MongoMessageRepository,
    },
  ],
  exports: [ItemsService],
})
export class ItemsModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistUseCase } from '../../../application/use-cases/wishlist/create-wishlist.use-case';
import { GetUserWishlistsUseCase } from '../../../application/use-cases/wishlist/get-user-wishlists.use-case';
import { GetWishlistByIdUseCase } from '../../../application/use-cases/wishlist/get-wishlist-by-id.use-case';
import { FindWishlistByIdUseCase } from '../../../application/use-cases/wishlist/find-wishlist-by-id.use-case';
import { SoftDeleteWishlistUseCase } from '../../../application/use-cases/wishlist/soft-delete-wishlist.use-case';
import { RestoreWishlistUseCase } from '../../../application/use-cases/wishlist/restore-wishlist.use-case';
import { HardDeleteWishlistUseCase } from '../../../application/use-cases/wishlist/hard-delete-wishlist.use-case';
import { PurgeArchivedWishlistsUseCase } from '../../../application/use-cases/wishlist/purge-archived-wishlists.use-case';
import { UpdateWishlistSharingUseCase } from '../../../application/use-cases/wishlist/update-wishlist-sharing.use-case';
import { UpdateWishlistUseCase } from '../../../application/use-cases/wishlist/update-wishlist.use-case';
import { CreateItemUseCase } from '../../../application/use-cases/item/create-item.use-case';
import { MongoWishlistRepository } from '../../database/repositories/mongo.wishlist.repository';
import { MongoItemRepository } from '../../database/repositories/mongo.item.repository';
import { MongoReservationRepository } from '../../database/repositories/mongo.reservation.repository';
import { MongoConversationRepository } from '../../database/repositories/mongo.conversation.repository';
import { MongoMessageRepository } from '../../database/repositories/mongo.message.repository';
import {
  Wishlist,
  WishlistSchema,
} from '../../database/schemas/wishlist.schema';
import { Item, ItemSchema } from '../../database/schemas/item.schema';
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
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [WishlistsController],
  providers: [
    WishlistsService,
    CreateWishlistUseCase,
    GetUserWishlistsUseCase,
    GetWishlistByIdUseCase,
    FindWishlistByIdUseCase,
    SoftDeleteWishlistUseCase,
    RestoreWishlistUseCase,
    HardDeleteWishlistUseCase,
    PurgeArchivedWishlistsUseCase,
    UpdateWishlistSharingUseCase,
    UpdateWishlistUseCase,
    CreateItemUseCase,
    {
      provide: 'IWishlistRepository',
      useClass: MongoWishlistRepository,
    },
    {
      provide: 'IItemRepository',
      useClass: MongoItemRepository,
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
  exports: [WishlistsService],
})
export class WishlistsModule {}

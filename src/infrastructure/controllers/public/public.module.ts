import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { GetPublicWishlistUseCase } from '../../../application/use-cases/wishlist/get-public-wishlist.use-case';
import { MongoWishlistRepository } from '../../database/repositories/mongo.wishlist.repository';
import { MongoItemRepository } from '../../database/repositories/mongo.item.repository';
import { MongoUserRepository } from '../../database/repositories/mongo.user.repository';
import {
  Wishlist,
  WishlistSchema,
} from '../../database/schemas/wishlist.schema';
import { Item, ItemSchema } from '../../database/schemas/item.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Item.name, schema: ItemSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PublicController],
  providers: [
    PublicService,
    GetPublicWishlistUseCase,
    {
      provide: 'IWishlistRepository',
      useClass: MongoWishlistRepository,
    },
    {
      provide: 'IItemRepository',
      useClass: MongoItemRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
  ],
  exports: [PublicService],
})
export class PublicModule {}

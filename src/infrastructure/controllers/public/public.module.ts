import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { GetPublicWishlistUseCase } from '../../../application/use-cases/wishlist/get-public-wishlist.use-case';
import { MongoWishlistRepository } from '../../database/repositories/mongo.wishlist.repository';
import { MongoItemRepository } from '../../database/repositories/mongo.item.repository';
import {
  Wishlist,
  WishlistSchema,
} from '../../database/schemas/wishlist.schema';
import { Item, ItemSchema } from '../../database/schemas/item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Item.name, schema: ItemSchema },
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
  ],
  exports: [PublicService],
})
export class PublicModule {}

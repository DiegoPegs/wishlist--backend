import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReserveItemUseCase } from '../../../application/use-cases/reservation/reserve-item.use-case';
import { GetUserReservationsUseCase } from '../../../application/use-cases/reservation/get-user-reservations.use-case';
import { GetReservationUseCase } from '../../../application/use-cases/reservation/get-reservation.use-case';
import { UpdateReservationQuantityUseCase } from '../../../application/use-cases/reservation/update-reservation-quantity.use-case';
import { ConfirmPurchaseUseCase } from '../../../application/use-cases/reservation/confirm-purchase.use-case';
import { CancelReservationUseCase } from '../../../application/use-cases/reservation/cancel-reservation.use-case';
import { MongoReservationRepository } from '../../database/repositories/mongo.reservation.repository';
import { MongoItemRepository } from '../../database/repositories/mongo.item.repository';
import { MongoWishlistRepository } from '../../database/repositories/mongo.wishlist.repository';
import { MongoUserRepository } from '../../database/repositories/mongo.user.repository';
import {
  Reservation,
  ReservationSchema,
} from '../../database/schemas/reservation.schema';
import { Item, ItemSchema } from '../../database/schemas/item.schema';
import {
  Wishlist,
  WishlistSchema,
} from '../../database/schemas/wishlist.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Wishlist.name, schema: WishlistSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReserveItemUseCase,
    GetUserReservationsUseCase,
    GetReservationUseCase,
    UpdateReservationQuantityUseCase,
    ConfirmPurchaseUseCase,
    CancelReservationUseCase,
    {
      provide: 'IReservationRepository',
      useClass: MongoReservationRepository,
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
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
  ],
  exports: [ReservationsService],
})
export class ReservationsModule {}

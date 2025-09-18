import { IsEnum, IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';
import { ReservationStatus } from '../enums/statuses.enum';

export class Reservation {
  @IsMongoId()
  _id: string;

  @IsMongoId()
  itemId: string;

  @IsMongoId()
  wishlistId: string;

  @IsMongoId()
  reservedByUserId: string;

  @IsMongoId()
  wishlistOwnerId: string;

  @IsNumber()
  quantity: number;

  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @IsNotEmpty()
  createdAt: Date;
}

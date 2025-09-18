import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'Item', required: true })
  itemId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Wishlist', required: true })
  wishlistId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reservedByUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  wishlistOwnerId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ enum: ReservationStatus, required: true })
  status: ReservationStatus;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

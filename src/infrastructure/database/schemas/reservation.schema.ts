import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReservationStatus } from '../../../domain/enums/statuses.enum';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: String, required: true })
  itemId: string;

  @Prop({ type: String, required: true })
  wishlistId: string;

  @Prop({ type: String, required: true })
  reservedByUserId: string;

  @Prop({ type: String, required: true })
  wishlistOwnerId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ enum: ReservationStatus, required: true })
  status: ReservationStatus;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

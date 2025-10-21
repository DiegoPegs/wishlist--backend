import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType, NotificationStatus } from '../../../domain/entities/notification.entity';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: String, required: true })
  recipientUserId: string;

  @Prop({
    type: String,
    enum: NotificationType,
    required: true,
  })
  type: NotificationType;

  @Prop({
    type: {
      dependentName: { type: String, required: false },
      deletedByGuardianId: { type: String, required: false },
    },
    required: true,
    _id: false,
  })
  data: {
    dependentName?: string;
    deletedByGuardianId?: string;
  };

  @Prop({
    type: String,
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
    required: true,
  })
  status: NotificationStatus;

  @Prop({ type: Number, default: 0, required: true })
  attempts: number;

  @Prop({ type: Date, required: false })
  lastAttemptAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

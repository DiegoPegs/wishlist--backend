import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification as NotificationSchema, NotificationDocument } from '../schemas/notification.schema';
import { Notification } from '../../../domain/entities/notification.entity';
import { INotificationRepository } from '../../../domain/repositories/notification.repository.interface';

@Injectable()
export class MongoNotificationRepository implements INotificationRepository {
  constructor(
    @InjectModel(NotificationSchema.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(notification: Notification): Promise<Notification> {
    const notificationData = {
      recipientUserId: notification.recipientUserId, // Manter como string
      type: notification.type,
      data: notification.data,
      status: notification.status,
      attempts: notification.attempts,
      lastAttemptAt: notification.lastAttemptAt,
    };

    const createdNotification = new this.notificationModel(notificationData);
    const saved = await createdNotification.save();

    return {
      _id: saved._id?.toString(),
      recipientUserId: saved.recipientUserId.toString(),
      type: saved.type,
      data: saved.data,
      status: saved.status,
      attempts: saved.attempts,
      lastAttemptAt: saved.lastAttemptAt,
    };
  }
}

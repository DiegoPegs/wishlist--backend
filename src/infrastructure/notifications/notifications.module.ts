import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '../database/schemas/notification.schema';
import { MongoNotificationRepository } from '../database/repositories/mongo.notification.repository';
import { CreateNotificationUseCase } from '../../application/use-cases/notification/create-notification.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [
    {
      provide: 'INotificationRepository',
      useClass: MongoNotificationRepository,
    },
    CreateNotificationUseCase,
  ],
  exports: [
    'INotificationRepository',
    CreateNotificationUseCase,
  ],
})
export class NotificationsModule {}

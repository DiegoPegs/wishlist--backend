import { Injectable, Inject } from '@nestjs/common';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository.interface';
import { Notification, NotificationType, NotificationStatus } from '../../../domain/entities/notification.entity';

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(
    recipientUserId: string,
    type: NotificationType,
    data: any,
  ): Promise<Notification> {
    const notification = new Notification();
    notification.recipientUserId = recipientUserId;
    notification.type = type;
    notification.data = data;
    notification.status = NotificationStatus.PENDING;
    notification.attempts = 0;

    return await this.notificationRepository.create(notification);
  }
}

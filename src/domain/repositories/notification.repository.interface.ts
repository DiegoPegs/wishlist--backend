import type { Notification } from '../entities/notification.entity';

export interface INotificationRepository {
  create(notification: Notification): Promise<Notification>;
}

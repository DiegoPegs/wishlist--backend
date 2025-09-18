import type { Message } from '../entities/message.entity';

export interface IMessageRepository {
  create(message: Message): Promise<Message>;
  findByConversationId(_conversationId: string): Promise<Message[]>;
  deleteByConversationId(_conversationId: string): Promise<boolean>;
  deleteByItemId(itemId: string): Promise<boolean>;
  deleteByUserId(_userId: string): Promise<boolean>;
}

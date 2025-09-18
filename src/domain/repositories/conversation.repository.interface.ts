import type { Conversation } from '../entities/conversation.entity';

export interface IConversationRepository {
  create(conversation: Conversation): Promise<Conversation>;
  findById(_id: string): Promise<Conversation | null>;
  findByItemIdAndParticipants(
    itemId: string,
    _participants: string[],
  ): Promise<Conversation | null>;
  findByItemId(itemId: string): Promise<Conversation[]>;
  findByUserId(_userId: string): Promise<Conversation[]>;
  delete(_id: string): Promise<boolean>;
  deleteByItemId(itemId: string): Promise<boolean>;
  deleteByUserId(_userId: string): Promise<boolean>;
}

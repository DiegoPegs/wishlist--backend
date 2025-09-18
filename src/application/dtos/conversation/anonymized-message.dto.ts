import { Message } from '../../../domain/entities/message.entity';

export class AnonymizedMessageDto {
  _id: string;
  conversationId: string;
  senderAlias: string; // "Você" ou "Outro Amigo"
  message: string;
  timestamp: Date;
  isFromCurrentUser: boolean;

  constructor(message: Message, currentUserId: string) {
    this._id = message._id.toString();
    this.conversationId = message.conversationId.toString();
    this.message = message.message;
    this.timestamp = message.timestamp;
    this.isFromCurrentUser = message.senderId.toString() === currentUserId;
    this.senderAlias = this.isFromCurrentUser ? 'Você' : 'Outro Amigo';
  }
}

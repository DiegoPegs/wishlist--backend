import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Message as MessageSchema,
  MessageDocument,
} from '../schemas/message.schema';
import {
  Conversation as ConversationSchema,
  ConversationDocument,
} from '../schemas/conversation.schema';
import { Message } from '../../../domain/entities/message.entity';
import { IMessageRepository } from '../../../domain/repositories/message.repository.interface';
import { safeToString } from '../utils/type-guards';

@Injectable()
export class MongoMessageRepository implements IMessageRepository {
  constructor(
    @InjectModel(MessageSchema.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(ConversationSchema.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async create(message: Message): Promise<Message> {
    try {
      const createdMessage = new this.messageModel(message);
      const savedMessage = await createdMessage.save();
      return this.toDomain(savedMessage.toObject());
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while creating message');
    }
  }

  async findByConversationId(_conversationId: string): Promise<Message[]> {
    try {
      const messages = await this.messageModel
        .find({ conversationId: _conversationId })
        .sort({ timestamp: 1 })
        .lean()
        .exec();
      return messages.map((message) => this.toDomain(message as any));
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'An unknown error occurred while finding messages by conversation ID',
      );
    }
  }

  async deleteByConversationId(_conversationId: string): Promise<boolean> {
    try {
      const result = await this.messageModel
        .deleteMany({ conversationId: _conversationId })
        .exec();
      return result.deletedCount > 0;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'An unknown error occurred while deleting messages by conversation ID',
      );
    }
  }

  async deleteByItemId(itemId: string): Promise<boolean> {
    try {
      // Primeiro, buscar todas as conversas relacionadas ao item
      const conversations = await this.conversationModel
        .find({ itemId: itemId })
        .lean()
        .exec();
      const conversationIds = conversations.map((conv) =>
        safeToString(conv._id),
      );

      // Deletar todas as mensagens dessas conversas
      const result = await this.messageModel
        .deleteMany({
          conversationId: { $in: conversationIds },
        })
        .exec();

      return result.deletedCount > 0;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'An unknown error occurred while deleting messages by item ID',
      );
    }
  }

  async deleteByUserId(_userId: string): Promise<boolean> {
    try {
      const result = await this.messageModel
        .deleteMany({ senderId: _userId })
        .exec();
      return result.deletedCount > 0;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        'An unknown error occurred while deleting messages by user ID',
      );
    }
  }

  private toDomain(messageDocument: MessageDocument): Message {
    const message = new Message();
    message._id = safeToString(messageDocument._id);
    message.conversationId = safeToString(messageDocument.conversationId);
    message.senderId = safeToString(messageDocument.senderId);
    message.message = messageDocument.message;
    message.timestamp = messageDocument.timestamp;
    return message;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation as ConversationSchema,
  ConversationDocument,
} from '../schemas/conversation.schema';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { IConversationRepository } from '../../../domain/repositories/conversation.repository.interface';
import { safeToString, safeToStringArray } from '../utils/type-guards';

@Injectable()
export class MongoConversationRepository implements IConversationRepository {
  constructor(
    @InjectModel(ConversationSchema.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async create(conversation: Conversation): Promise<Conversation> {
    const createdConversation = new this.conversationModel(conversation);
    const savedConversation = await createdConversation.save();
    return this.toDomain(savedConversation.toObject());
  }

  async findById(_id: string): Promise<Conversation | null> {
    const conversation = await this.conversationModel
      .findById(_id)
      .lean()
      .exec();
    return conversation ? this.toDomain(conversation as any) : null;
  }

  async findByItemIdAndParticipants(
    itemId: string,
    _participants: string[],
  ): Promise<Conversation | null> {
    const conversation = await this.conversationModel
      .findOne({
        itemId: itemId,
        participants: { $all: _participants },
      })
      .lean()
      .exec();
    return conversation ? this.toDomain(conversation as any) : null;
  }

  async findByItemId(itemId: string): Promise<Conversation[]> {
    const conversations = await this.conversationModel
      .find({ itemId: itemId })
      .lean()
      .exec();
    return conversations.map((conversation) =>
      this.toDomain(conversation as any),
    );
  }

  async findByUserId(_userId: string): Promise<Conversation[]> {
    const conversations = await this.conversationModel
      .find({ participants: _userId })
      .lean()
      .exec();
    return conversations.map((conversation) =>
      this.toDomain(conversation as any),
    );
  }

  async delete(_id: string): Promise<boolean> {
    const result = await this.conversationModel.findByIdAndDelete(_id).exec();
    return !!result;
  }

  async deleteByItemId(itemId: string): Promise<boolean> {
    const result = await this.conversationModel
      .deleteMany({ itemId: itemId })
      .exec();
    return result.deletedCount > 0;
  }

  async deleteByUserId(_userId: string): Promise<boolean> {
    const result = await this.conversationModel
      .deleteMany({ participants: _userId })
      .exec();
    return result.deletedCount > 0;
  }

  private toDomain(conversationDocument: ConversationDocument): Conversation {
    const conversation = new Conversation();
    conversation._id = safeToString(conversationDocument._id);
    conversation.itemId = safeToString(conversationDocument.itemId);
    conversation.participants = safeToStringArray(
      conversationDocument.participants,
    );
    return conversation;
  }
}

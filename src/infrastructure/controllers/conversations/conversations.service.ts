import { Injectable } from '@nestjs/common';
import { SendMessageDto } from '../../../application/dtos/conversation/send-message.dto';
import { AnonymizedMessageDto } from '../../../application/dtos/conversation/anonymized-message.dto';
import { StartConversationUseCase } from '../../../application/use-cases/conversation/start-conversation.use-case';
import { GetConversationMessagesUseCase } from '../../../application/use-cases/conversation/get-conversation-messages.use-case';
import { SendMessageUseCase } from '../../../application/use-cases/conversation/send-message.use-case';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { Message } from '../../../domain/entities/message.entity';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly startConversationUseCase: StartConversationUseCase,
    private readonly getConversationMessagesUseCase: GetConversationMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  async startConversation(
    itemId: string,
    userId: string,
  ): Promise<Conversation> {
    return await this.startConversationUseCase.execute(itemId, userId);
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
  ): Promise<AnonymizedMessageDto[]> {
    return await this.getConversationMessagesUseCase.execute(
      conversationId,
      userId,
    );
  }

  async sendMessage(
    conversationId: string,
    sendMessageDto: SendMessageDto,
    userId: string,
  ): Promise<Message> {
    return await this.sendMessageUseCase.execute(
      conversationId,
      sendMessageDto,
      userId,
    );
  }
}

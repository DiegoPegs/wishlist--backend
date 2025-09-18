import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { SendMessageDto } from '../../../application/dtos/conversation/send-message.dto';
import { Message } from '../../../domain/entities/message.entity';
import type { IConversationRepository } from '../../../domain/repositories/conversation.repository.interface';
import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    conversationId: string,
    sendMessageDto: SendMessageDto,
    userId: string,
  ): Promise<Message> {
    // Buscar a conversa
    const conversation =
      await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verificar se o usuário é participante da conversa
    const isParticipant = conversation.participants.some(
      (participantId) => participantId.toString() === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }

    // Criar nova mensagem
    const message = new Message();
    message.conversationId = conversation._id.toString();
    message.senderId = userId;
    message.message = sendMessageDto.message;
    message.timestamp = new Date();

    return await this.messageRepository.create(message);
  }
}

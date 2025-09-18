import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { AnonymizedMessageDto } from '../../../application/dtos/conversation/anonymized-message.dto';
import type { IConversationRepository } from '../../../domain/repositories/conversation.repository.interface';
import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';

@Injectable()
export class GetConversationMessagesUseCase {
  constructor(
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    _conversationId: string,
    _userId: string,
  ): Promise<AnonymizedMessageDto[]> {
    // Buscar a conversa
    const conversation =
      await this.conversationRepository.findById(_conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verificar se o usuário é participante da conversa
    const isParticipant = conversation.participants.some(
      (participantId) => participantId.toString() === _userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }

    // Buscar as mensagens da conversa
    const messages =
      await this.messageRepository.findByConversationId(_conversationId);

    // Anonimizar as mensagens
    return messages.map(
      (message) => new AnonymizedMessageDto(message, _userId),
    );
  }
}

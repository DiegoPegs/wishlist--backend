import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SendMessageDto } from '../../../application/dtos/conversation/send-message.dto';
import { AnonymizedMessageDto } from '../../../application/dtos/conversation/anonymized-message.dto';
import { ConversationsService } from './conversations.service';
import { GetUser } from '../users/get-user.decorator';
import { User } from '../../../domain/entities/user.entity';
import { Conversation } from '../../../domain/entities/conversation.entity';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('items/:itemId/start')
  @HttpCode(HttpStatus.CREATED)
  async startConversation(
    @Param('itemId') itemId: string,
    @GetUser() user: User,
  ): Promise<Conversation> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.conversationsService.startConversation(
      itemId,
      user._id.toString(),
    );
  }

  @Get(':id/messages')
  async getConversationMessages(
    @Param('id') conversationId: string,
    @GetUser() user: User,
  ): Promise<AnonymizedMessageDto[]> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.conversationsService.getConversationMessages(
      conversationId,
      user._id.toString(),
    );
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('id') conversationId: string,
    @GetUser() user: User,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<{ message: string; timestamp: Date }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    const message = await this.conversationsService.sendMessage(
      conversationId,
      sendMessageDto,
      user._id.toString(),
    );
    return {
      message: message.message,
      timestamp: message.timestamp,
    };
  }
}

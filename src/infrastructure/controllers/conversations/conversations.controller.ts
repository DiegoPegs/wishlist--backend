import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParseMongoIdPipe } from '../../pipes/parse-mongo-id.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SendMessageDto } from '../../../application/dtos/conversation/send-message.dto';
import { AnonymizedMessageDto } from '../../../application/dtos/conversation/anonymized-message.dto';
import { ConversationsService } from './conversations.service';
import { GetUser } from '../users/get-user.decorator';
import { User } from '../../../domain/entities/user.entity';
import { Conversation } from '../../../domain/entities/conversation.entity';

@ApiTags('Conversations')
@ApiBearerAuth()
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('items/:itemId/start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Iniciar conversa sobre item',
    description: 'Inicia uma conversa anônima sobre um item específico',
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID do item sobre o qual iniciar a conversa',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 201,
    description: 'Conversa iniciada com sucesso',
    type: Conversation,
  })
  @ApiResponse({
    status: 404,
    description: 'Item não encontrado',
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuário não tem permissão para iniciar conversa sobre este item',
  })
  async startConversation(
    @Param('itemId', ParseMongoIdPipe) itemId: string,
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
  @ApiOperation({
    summary: 'Obter mensagens da conversa',
    description:
      'Retorna todas as mensagens de uma conversa específica (anonimizadas)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da conversa',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensagens obtidas com sucesso',
    type: [AnonymizedMessageDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Conversa não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para ver esta conversa',
  })
  async getConversationMessages(
    @Param('id', ParseMongoIdPipe) conversationId: string,
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
  @ApiOperation({
    summary: 'Enviar mensagem na conversa',
    description: 'Envia uma mensagem anônima em uma conversa específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da conversa',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 201,
    description: 'Mensagem enviada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Mensagem enviada',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Conversa não encontrada',
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuário não tem permissão para enviar mensagem nesta conversa',
  })
  async sendMessage(
    @Param('id', ParseMongoIdPipe) conversationId: string,
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

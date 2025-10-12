import {
  Controller,
  Post,
  Put,
  Patch,
  Delete,
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
import { UpdateItemMetadataDto } from '../../../application/dtos/item/update-item-metadata.dto';
import { ChangeDesiredQuantityDto } from '../../../application/dtos/item/change-desired-quantity.dto';
import { MarkAsReceivedDto } from '../../../application/dtos/item/mark-as-received.dto';
import { ItemsService } from './items.service';
import { GetUser } from '../users/get-user.decorator';
import { User } from '../../../domain/entities/user.entity';
import { Item } from '../../../domain/entities/item.entity';

@ApiTags('Items')
@ApiBearerAuth()
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar metadados do item',
    description:
      'Atualiza os metadados de um item existente (título, link, imagem, preço, notas, etc.)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do item a ser atualizado',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Metadados do item atualizados com sucesso',
    type: Item,
  })
  @ApiResponse({
    status: 404,
    description: 'Item não encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para atualizar este item',
  })
  async updateItemMetadata(
    @Param('id', ParseMongoIdPipe) itemId: string,
    @GetUser() user: User,
    @Body() updateItemDto: UpdateItemMetadataDto,
  ): Promise<Item> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.itemsService.updateItemMetadata(
      itemId,
      updateItemDto,
      user._id.toString(),
    );
  }

  @Patch(':id/quantity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Alterar quantidade desejada do item',
    description:
      'Altera a quantidade desejada de um item. Se a nova quantidade for menor que a quantidade já reservada, cancela as reservas mais antigas automaticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do item a ser atualizado',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Quantidade desejada alterada com sucesso',
    type: Item,
  })
  @ApiResponse({
    status: 404,
    description: 'Item não encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para alterar este item',
  })
  @ApiResponse({
    status: 400,
    description: 'Quantidade inválida',
  })
  async changeDesiredQuantity(
    @Param('id', ParseMongoIdPipe) itemId: string,
    @GetUser() user: User,
    @Body() changeQuantityDto: ChangeDesiredQuantityDto,
  ): Promise<Item> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.itemsService.changeDesiredQuantity(
      itemId,
      changeQuantityDto,
      user._id.toString(),
    );
  }

  @Post(':id/mark-as-received')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar item como recebido',
    description:
      'Marca uma quantidade específica de um item como recebida de um usuário específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do item a ser marcado como recebido',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Item marcado como recebido com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Successfully marked 1 items as received from user 507f1f77bcf86cd799439012',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Item não encontrado ou reserva ativa não encontrada',
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuário não tem permissão para marcar este item como recebido',
  })
  @ApiResponse({
    status: 400,
    description: 'Quantidade recebida excede a quantidade disponível',
  })
  async markAsReceived(
    @Param('id', ParseMongoIdPipe) itemId: string,
    @GetUser() user: User,
    @Body() markAsReceivedDto: MarkAsReceivedDto,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.itemsService.markAsReceived(
      itemId,
      markAsReceivedDto,
      user._id.toString(),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir item permanentemente',
    description:
      'Exclui um item permanentemente com exclusão em cascata de todas as entidades relacionadas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do item a ser excluído',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Item excluído com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Item não encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para excluir este item',
  })
  async deleteItem(
    @Param('id', ParseMongoIdPipe) itemId: string,
    @GetUser() user: User,
  ): Promise<void> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    await this.itemsService.deleteItem(itemId, user._id.toString());
  }
}

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateWishlistDto } from '../../../application/dtos/wishlist/create-wishlist.dto';
import { CreateItemDto } from '../../../application/dtos/item/create-item.dto';
import { WishlistWithItemsDto } from '../../../application/dtos/wishlist/wishlist-with-items.dto';
import { WishlistsService } from './wishlists.service';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { Item } from '../../../domain/entities/item.entity';
import { GetUser } from '../users/get-user.decorator';
import { User } from '../../../domain/entities/user.entity';

@ApiTags('Wishlists')
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova wishlist',
    description: 'Cria uma nova lista de desejos para o usuário autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Wishlist criada com sucesso',
    type: Wishlist,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou expirado',
  })
  async createWishlist(
    @Body() createWishlistDto: CreateWishlistDto,
    @GetUser() user: User,
  ): Promise<Wishlist> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.wishlistsService.createWishlist(
      createWishlistDto,
      user._id.toString(),
    );
  }

  @Get('mine')
  @ApiOperation({
    summary: 'Listar minhas wishlists',
    description: 'Retorna todas as wishlists do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de wishlists obtida com sucesso',
    type: [Wishlist],
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou expirado',
  })
  async getMyWishlists(@GetUser() user: User): Promise<Wishlist[]> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.wishlistsService.getUserWishlists(user._id.toString());
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar wishlist por ID com itens',
    description:
      'Retorna uma wishlist específica com todos os seus itens e status de reserva',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da wishlist',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist encontrada com sucesso',
    type: WishlistWithItemsDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Wishlist não encontrada',
  })
  async getWishlistById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<WishlistWithItemsDto> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.wishlistsService.findWishlistByIdWithItems(
      id,
      user._id.toString(),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Arquivar wishlist',
    description:
      'Arquiva uma wishlist (soft delete) - pode ser restaurada posteriormente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da wishlist a ser arquivada',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist arquivada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Wishlist archived successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Wishlist não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para arquivar esta wishlist',
  })
  async archiveWishlist(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.wishlistsService.archiveWishlist(id, user._id.toString());
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restaurar wishlist arquivada',
    description: 'Restaura uma wishlist previamente arquivada',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da wishlist a ser restaurada',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist restaurada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Wishlist restored successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Wishlist não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para restaurar esta wishlist',
  })
  async restoreWishlist(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.wishlistsService.restoreWishlist(id, user._id.toString());
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Excluir wishlist permanentemente',
    description:
      'Exclui uma wishlist permanentemente com exclusão em cascata - NÃO PODE SER DESFEITO',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da wishlist a ser excluída permanentemente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist excluída permanentemente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Wishlist deleted permanently',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Wishlist não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para excluir esta wishlist',
  })
  async permanentlyDeleteWishlist(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.wishlistsService.permanentlyDeleteWishlist(
      id,
      user._id.toString(),
    );
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Adicionar item à wishlist',
    description: 'Adiciona um novo item a uma wishlist específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da wishlist',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 201,
    description: 'Item adicionado com sucesso',
    type: Item,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou expirado',
  })
  @ApiResponse({
    status: 404,
    description: 'Wishlist não encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para adicionar itens a esta wishlist',
  })
  async createItem(
    @Param('id') wishlistId: string,
    @Body() createItemDto: CreateItemDto,
    @GetUser() user: User,
  ): Promise<Item> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.wishlistsService.createItem(
      createItemDto,
      wishlistId,
      user._id.toString(),
    );
  }
}

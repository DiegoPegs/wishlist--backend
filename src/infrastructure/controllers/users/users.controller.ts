import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ParseMongoIdPipe } from '../../pipes/parse-mongo-id.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiConflictResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateGiftingProfileDto } from '../../../application/dtos/user/update-gifting-profile.dto';
import { UpdateProfileDto } from '../../../application/dtos/user/update-profile.dto';
import { UpdateLanguageDto } from '../../../application/dtos/user/update-language.dto';
import { CreateDependentDto } from '../../../application/dtos/user/create-dependent.dto';
import { AddGuardianDto } from '../../../application/dtos/user/add-guardian.dto';
import { CreateDependentWishlistDto } from '../../../application/dtos/wishlist/create-dependent-wishlist.dto';
import { UpdateWishlistSharingDto } from '../../../application/dtos/wishlist/update-wishlist-sharing.dto';
import { UsersService } from './users.service';
import { GetUser } from './get-user.decorator';
import { User } from '../../../domain/entities/user.entity';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { WishlistWithItemsResponseDto } from '../../../application/dtos/wishlist/wishlist-with-items-response.dto';
import { WishlistWithItemsDto } from '../../../application/dtos/wishlist/wishlist-with-items.dto';
import { UpdateWishlistDto } from '../../../application/dtos/wishlist/update-wishlist.dto';
import { CreateItemDto } from '../../../application/dtos/item/create-item.dto';
import { UpdateItemMetadataDto } from '../../../application/dtos/item/update-item-metadata.dto';
import { MarkAsReceivedDto } from '../../../application/dtos/item/mark-as-received.dto';
import { UpdateItemQuantityDto } from '../../../application/dtos/item/update-item-quantity.dto';
import { Item } from '../../../domain/entities/item.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Obter dados do usuário atual',
    description:
      'Retorna os dados completos do usuário autenticado, incluindo perfil de presentes e dependentes',
  })
  @ApiOkResponse({
    description: 'Dados do usuário atual obtidos com sucesso',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  async getCurrentUser(@Req() req: any): Promise<any> {
    if (!req.user) {
      throw new Error('User not found in request');
    }

    return await this.usersService.getCurrentUser(req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  @ApiOperation({
    summary: 'Atualizar perfil do usuário',
    description:
      'Atualiza as informações básicas do perfil do usuário autenticado',
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Dados do perfil para atualização',
  })
  @ApiOkResponse({
    description: 'Perfil atualizado com sucesso',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  async updateProfile(
    @GetUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.updateProfile(
      user._id.toString(),
      updateProfileDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/language')
  @ApiOperation({
    summary: 'Atualizar idioma do usuário',
    description:
      'Atualiza o idioma preferido do usuário autenticado',
  })
  @ApiBody({
    type: UpdateLanguageDto,
    description: 'Idioma preferido do usuário',
  })
  @ApiOkResponse({
    description: 'Idioma atualizado com sucesso',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  async updateLanguage(
    @GetUser() user: User,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ): Promise<User> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.updateLanguage(
      user._id.toString(),
      updateLanguageDto,
    );
  }

  @Put('me/gifting-profile')
  @ApiOperation({
    summary: 'Atualizar perfil de presentes',
    description:
      'Atualiza as informações do perfil de presentes do usuário autenticado',
  })
  @ApiBody({
    type: UpdateGiftingProfileDto,
    description: 'Dados do perfil de presentes para atualização',
  })
  @ApiOkResponse({
    description: 'Perfil de presentes atualizado com sucesso',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  async updateGiftingProfile(
    @GetUser() user: User,
    @Body() updateGiftingProfileDto: UpdateGiftingProfileDto,
  ): Promise<User> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.updateGiftingProfile(
      user._id.toString(),
      updateGiftingProfileDto,
    );
  }

  @Get('me/dependents')
  @ApiOperation({
    summary: 'Listar dependentes do usuário',
    description:
      'Lista todos os dependentes do usuário autenticado, com filtro opcional por status',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'INACTIVE'],
    description: 'Filtrar dependentes por status (opcional)',
  })
  @ApiOkResponse({
    description: 'Lista de dependentes obtida com sucesso',
    type: [User],
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  async getDependents(
    @GetUser() user: User,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE',
  ): Promise<User[]> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.getDependentsByGuardian(
      user._id.toString(),
      status,
    );
  }

  @Post('me/dependents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar dependente',
    description:
      'Cria um novo dependente associado ao usuário autenticado como guardião',
  })
  @ApiBody({
    type: CreateDependentDto,
    description: 'Dados do dependente a ser criado',
  })
  @ApiCreatedResponse({
    description: 'Dependente criado com sucesso',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para criar dependentes',
  })
  async createDependent(
    @GetUser() user: User,
    @Body() createDependentDto: CreateDependentDto,
  ): Promise<User> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.createDependent(
      createDependentDto,
      user._id.toString(),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('dependents/:id')
  @ApiOperation({
    summary: 'Buscar detalhes de um dependente',
    description:
      'Busca os detalhes de um dependente específico. Apenas guardiões autorizados podem visualizar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Detalhes do dependente obtidos com sucesso',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente não encontrado',
  })
  @ApiForbiddenResponse({
    description:
      'Usuário não tem permissão para visualizar os detalhes deste dependente',
  })
  async findDependentById(
    @Param('id', ParseMongoIdPipe) dependentId: string,
    @GetUser() user: User,
  ): Promise<User> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.findDependentById(
      dependentId,
      user._id.toString(),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('dependents/:id/wishlists')
  @ApiOperation({
    summary: 'Buscar wishlists de um dependente',
    description:
      'Busca todas as wishlists de um dependente específico. Apenas guardiões autorizados podem visualizar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Lista de wishlists do dependente obtida com sucesso',
    type: [Wishlist],
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente não encontrado',
  })
  @ApiForbiddenResponse({
    description:
      'Usuário não tem permissão para visualizar as wishlists deste dependente',
  })
  async findDependentWishlists(
    @Param('id', ParseMongoIdPipe) dependentId: string,
    @GetUser() user: User,
  ): Promise<Wishlist[]> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.findDependentWishlists(
      dependentId,
      user._id.toString(),
    );
  }

  @Get('dependents/:dependentId/wishlists')
  @ApiOperation({
    summary: 'Listar wishlists de um dependente',
    description:
      'Lista todas as wishlists de um dependente específico. Apenas guardiões autorizados podem visualizar.',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Lista de wishlists do dependente obtida com sucesso',
    type: [WishlistWithItemsResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente não encontrado',
  })
  @ApiForbiddenResponse({
    description:
      'Usuário não tem permissão para visualizar as wishlists deste dependente',
  })
  async getDependentWishlists(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @GetUser() user: User,
  ): Promise<WishlistWithItemsResponseDto[]> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.getDependentWishlists(
      dependentId,
      user._id.toString(),
    );
  }

  @Get('dependents/:dependentId/wishlists/:wishlistId')
  @ApiOperation({
    summary: 'Buscar wishlist específica de um dependente',
    description:
      'Retorna uma wishlist específica de um dependente com todos os seus itens e status de reserva. Apenas guardiões autorizados podem visualizar.',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiParam({
    name: 'wishlistId',
    description: 'ID da wishlist',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Wishlist do dependente obtida com sucesso',
    type: WishlistWithItemsDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou wishlist não encontrado',
  })
  @ApiForbiddenResponse({
    description:
      'Usuário não tem permissão para visualizar wishlists deste dependente',
  })
  async findDependentWishlistById(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @Param('wishlistId', ParseMongoIdPipe) wishlistId: string,
    @GetUser() user: User,
  ): Promise<WishlistWithItemsDto> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.findDependentWishlistById(
      dependentId,
      wishlistId,
      user._id.toString(),
    );
  }

  @Post('dependents/:dependentId/wishlists')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar lista de desejos para dependente',
    description:
      'Permite que um guardião crie uma lista de desejos para um de seus dependentes',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente para quem a lista será criada',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiBody({
    type: CreateDependentWishlistDto,
    description: 'Dados da lista de desejos a ser criada',
  })
  @ApiCreatedResponse({
    description: 'Lista de desejos criada com sucesso',
    type: Wishlist,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente não encontrado',
  })
  @ApiForbiddenResponse({
    description:
      'Usuário não tem permissão para criar listas para este dependente',
  })
  async createDependentWishlist(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @GetUser() user: User,
    @Body() createDependentWishlistDto: CreateDependentWishlistDto,
  ): Promise<Wishlist> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.createDependentWishlist(
      createDependentWishlistDto,
      dependentId,
      user._id.toString(),
    );
  }

  @Put('dependents/:dependentId/wishlists/:wishlistId/sharing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar compartilhamento de wishlist de dependente',
    description:
      'Permite que um guardião atualize as configurações de compartilhamento de uma wishlist de seu dependente',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiParam({
    name: 'wishlistId',
    description: 'ID da wishlist',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
  })
  @ApiBody({
    type: UpdateWishlistSharingDto,
    description: 'Configurações de compartilhamento da wishlist',
  })
  @ApiOkResponse({
    description: 'Compartilhamento atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        isPublic: {
          type: 'boolean',
          example: true,
        },
        publicLinkToken: {
          type: 'string',
          example: 'abc123def456',
        },
        publicUrl: {
          type: 'string',
          example: 'http://localhost:3001/public/abc123def456',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou wishlist não encontrado',
  })
  @ApiForbiddenResponse({
    description:
      'Usuário não tem permissão para alterar wishlists deste dependente',
  })
  async updateDependentWishlistSharing(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @Param('wishlistId', ParseMongoIdPipe) wishlistId: string,
    @Body() updateWishlistSharingDto: UpdateWishlistSharingDto,
    @GetUser() user: User,
  ): Promise<{
    isPublic: boolean;
    publicLinkToken?: string;
    publicUrl?: string;
  }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.updateDependentWishlistSharing(
      dependentId,
      wishlistId,
      updateWishlistSharingDto,
      user._id.toString(),
    );
  }

  @Post('dependents/:id/add-guardian')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Adicionar guardião ao dependente',
    description:
      'Adiciona um guardião à lista de guardiões de um dependente. O guardião atual deve seguir o novo guardião.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiBody({
    type: AddGuardianDto,
    description: 'Dados do novo guardião a ser adicionado',
  })
  @ApiOkResponse({
    description: 'Guardião adicionado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Guardião adicionado com sucesso',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos ou novo guardião já está na lista',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou guardião não encontrado',
  })
  @ApiForbiddenResponse({
    description:
      'Usuário não tem permissão para adicionar guardiões ou não segue o novo guardião',
  })
  async addGuardian(
    @Param('id', ParseMongoIdPipe) dependentId: string,
    @GetUser() user: User,
    @Body() addGuardianDto: AddGuardianDto,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.addGuardian(
      dependentId,
      addGuardianDto,
      user._id.toString(),
    );
  }

  @Delete('dependents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Desativar dependente',
    description:
      'Desativa um dependente e remove a associação com todos os guardiões',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do dependente a ser desativado',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Dependente desativado com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para desativar este dependente',
  })
  async deactivateDependent(
    @Param('id', ParseMongoIdPipe) dependentId: string,
    @GetUser() user: User,
  ): Promise<void> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    await this.usersService.deactivateDependent(dependentId, user._id);
  }

  @Post('dependents/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restaurar dependente',
    description:
      'Restaura um dependente desativado e re-estabelece as associações com os guardiões',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do dependente a ser restaurado',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Dependente restaurado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Dependente restaurado com sucesso',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente não encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Dependente não está desativado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para restaurar este dependente',
  })
  async restoreDependent(
    @Param('id', ParseMongoIdPipe) dependentId: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.restoreDependent(dependentId, user._id);
  }

  @Delete('dependents/:id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir dependente permanentemente',
    description:
      'Exclui permanentemente um dependente desativado e todos os seus dados relacionados',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do dependente a ser excluído permanentemente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Dependente excluído permanentemente com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente não encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Dependente não está desativado',
  })
  @ApiForbiddenResponse({
    description:
      'Usuário não tem permissão para excluir permanentemente este dependente',
  })
  async permanentlyDeleteDependent(
    @Param('id', ParseMongoIdPipe) dependentId: string,
    @GetUser() user: User,
  ): Promise<void> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    await this.usersService.permanentlyDeleteDependent(user._id, dependentId);
  }

  @Post(':username/follow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Seguir usuário',
    description: 'Inicia o seguimento de outro usuário',
  })
  @ApiParam({
    name: 'username',
    description: 'Nome de usuário a ser seguido',
    example: 'joao.silva',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário seguido com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Usuário seguido com sucesso',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou expirado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Não é possível seguir a si mesmo',
  })
  async followUser(
    @Param('username') username: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.followUser(username, user._id);
  }

  @Delete(':username/follow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deixar de seguir usuário',
    description: 'Para de seguir outro usuário',
  })
  @ApiParam({
    name: 'username',
    description: 'Nome de usuário a deixar de seguir',
    example: 'joao.silva',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário deixado de seguir com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Usuário deixado de seguir com sucesso',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou expirado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async unfollowUser(
    @Param('username') username: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.unfollowUser(username, user._id);
  }

  @Get(':username/followers')
  @ApiOperation({
    summary: 'Obter seguidores do usuário',
    description: 'Retorna a lista de seguidores de um usuário específico',
  })
  @ApiParam({
    name: 'username',
    description: 'Nome de usuário',
    example: 'joao.silva',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de seguidores obtida com sucesso',
    type: [User],
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async getFollowers(@Param('username') username: string): Promise<User[]> {
    return await this.usersService.getFollowers(username);
  }

  @Get(':username/following')
  @ApiOperation({
    summary: 'Obter usuários seguidos',
    description:
      'Retorna a lista de usuários que um usuário específico está seguindo',
  })
  @ApiParam({
    name: 'username',
    description: 'Nome de usuário',
    example: 'joao.silva',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários seguidos obtida com sucesso',
    type: [User],
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async getFollowing(@Param('username') username: string): Promise<User[]> {
    return await this.usersService.getFollowing(username);
  }

  @Delete('dependents/:dependentId/guardianship')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover guardião de dependente',
    description:
      'Permite que um guardião remova a si mesmo de um perfil de dependente. Não é possível remover o último guardião.',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente do qual o guardião será removido',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiNoContentResponse({
    description: 'Guardião removido com sucesso',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente não encontrado',
  })
  @ApiConflictResponse({
    description:
      'Não é possível remover o último guardião ou usuário não é guardião deste dependente',
  })
  async removeGuardianship(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @GetUser() user: User,
  ): Promise<void> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.removeGuardianship(
      dependentId,
      user._id.toString(),
    );
  }

  @Get(':username')
  @ApiOperation({
    summary: 'Obter usuário por username',
    description:
      'Retorna os dados públicos de um usuário específico pelo seu username',
  })
  @ApiParam({
    name: 'username',
    description: 'Nome de usuário único',
    example: 'joao.silva',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Dados do usuário obtidos com sucesso',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  async getUserByUsername(@Param('username') username: string): Promise<User> {
    return await this.usersService.getUserByUsername(username);
  }

  // Wishlist operations for dependents
  @Delete('dependents/:dependentId/wishlists/:wishlistId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Arquivar wishlist de dependente',
    description: 'Permite que um guardião arquive uma wishlist de seu dependente',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiParam({
    name: 'wishlistId',
    description: 'ID da wishlist',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Wishlist arquivada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Wishlist arquivada com sucesso',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou wishlist não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para arquivar wishlists deste dependente',
  })
  async softDeleteDependentWishlist(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @Param('wishlistId', ParseMongoIdPipe) wishlistId: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.softDeleteDependentWishlist(
      dependentId,
      wishlistId,
      user._id.toString(),
    );
  }

  @Delete('dependents/:dependentId/wishlists/:wishlistId/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Excluir permanentemente wishlist de dependente',
    description: 'Permite que um guardião exclua permanentemente uma wishlist de seu dependente',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiParam({
    name: 'wishlistId',
    description: 'ID da wishlist',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Wishlist excluída permanentemente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Wishlist excluída permanentemente',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou wishlist não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para excluir wishlists deste dependente',
  })
  async hardDeleteDependentWishlist(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @Param('wishlistId', ParseMongoIdPipe) wishlistId: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.hardDeleteDependentWishlist(
      dependentId,
      wishlistId,
      user._id.toString(),
    );
  }

  @Post('dependents/:dependentId/wishlists/:wishlistId/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restaurar wishlist de dependente',
    description: 'Permite que um guardião restaure uma wishlist arquivada de seu dependente',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiParam({
    name: 'wishlistId',
    description: 'ID da wishlist',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Wishlist restaurada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Wishlist restaurada com sucesso',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou wishlist não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para restaurar wishlists deste dependente',
  })
  async restoreDependentWishlist(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @Param('wishlistId', ParseMongoIdPipe) wishlistId: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.restoreDependentWishlist(
      dependentId,
      wishlistId,
      user._id.toString(),
    );
  }

  @Put('dependents/:dependentId/wishlists/:wishlistId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar wishlist de dependente',
    description: 'Permite que um guardião atualize uma wishlist de seu dependente',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiParam({
    name: 'wishlistId',
    description: 'ID da wishlist',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
  })
  @ApiBody({
    type: UpdateWishlistDto,
    description: 'Dados para atualização da wishlist',
  })
  @ApiOkResponse({
    description: 'Wishlist atualizada com sucesso',
    type: Wishlist,
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou wishlist não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para atualizar wishlists deste dependente',
  })
  async updateDependentWishlist(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @Param('wishlistId', ParseMongoIdPipe) wishlistId: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @GetUser() user: User,
  ): Promise<Wishlist> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.updateDependentWishlist(
      dependentId,
      wishlistId,
      updateWishlistDto,
      user._id.toString(),
    );
  }

  // Item operations for dependents
  @Post('dependents/:dependentId/wishlists/:wishlistId/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar item em wishlist de dependente',
    description: 'Permite que um guardião crie um item em uma wishlist de seu dependente',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiParam({
    name: 'wishlistId',
    description: 'ID da wishlist',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
  })
  @ApiBody({
    type: CreateItemDto,
    description: 'Dados do item a ser criado',
  })
  @ApiCreatedResponse({
    description: 'Item criado com sucesso',
    type: Item,
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou wishlist não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para criar itens para este dependente',
  })
  async createDependentItem(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @Param('wishlistId', ParseMongoIdPipe) wishlistId: string,
    @Body() createItemDto: CreateItemDto,
    @GetUser() user: User,
  ): Promise<Item> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.createDependentItem(
      dependentId,
      wishlistId,
      createItemDto,
      user._id.toString(),
    );
  }

  @Delete('dependents/:dependentId/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Excluir item de dependente',
    description: 'Permite que um guardião exclua um item de seu dependente',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID do item',
    example: '507f1f77bcf86cd799439013',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Item excluído com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Item excluído com sucesso',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou item não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para excluir itens deste dependente',
  })
  async deleteDependentItem(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @Param('itemId', ParseMongoIdPipe) itemId: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.deleteDependentItem(
      dependentId,
      itemId,
      user._id.toString(),
    );
  }

  @Put('dependents/:dependentId/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar metadados de item de dependente',
    description: 'Permite que um guardião atualize os metadados de um item de seu dependente',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID do item',
    example: '507f1f77bcf86cd799439013',
    type: 'string',
  })
  @ApiBody({
    type: UpdateItemMetadataDto,
    description: 'Dados para atualização do item',
  })
  @ApiOkResponse({
    description: 'Item atualizado com sucesso',
    type: Item,
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou item não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para atualizar itens deste dependente',
  })
  async updateDependentItemMetadata(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @Param('itemId', ParseMongoIdPipe) itemId: string,
    @Body() updateItemMetadataDto: UpdateItemMetadataDto,
    @GetUser() user: User,
  ): Promise<Item> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.updateDependentItemMetadata(
      dependentId,
      itemId,
      updateItemMetadataDto,
      user._id.toString(),
    );
  }

  @Post('dependents/:dependentId/items/:itemId/mark-as-received')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar item de dependente como recebido',
    description: 'Permite que um guardião marque um item de seu dependente como recebido',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID do item',
    example: '507f1f77bcf86cd799439013',
    type: 'string',
  })
  @ApiBody({
    type: MarkAsReceivedDto,
    description: 'Dados para marcar como recebido',
  })
  @ApiOkResponse({
    description: 'Item marcado como recebido com sucesso',
    type: Item,
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou item não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para marcar itens como recebidos deste dependente',
  })
  async markDependentItemAsReceived(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @Param('itemId', ParseMongoIdPipe) itemId: string,
    @Body() markAsReceivedDto: MarkAsReceivedDto,
    @GetUser() user: User,
  ): Promise<Item> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.markDependentItemAsReceived(
      dependentId,
      itemId,
      markAsReceivedDto,
      user._id.toString(),
    );
  }

  @Patch('dependents/:dependentId/items/:itemId/quantity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar quantidade de item de dependente',
    description: 'Permite que um guardião atualize a quantidade desejada de um item de seu dependente',
  })
  @ApiParam({
    name: 'dependentId',
    description: 'ID do dependente',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID do item',
    example: '507f1f77bcf86cd799439013',
    type: 'string',
  })
  @ApiBody({
    type: UpdateItemQuantityDto,
    description: 'Nova quantidade desejada',
  })
  @ApiOkResponse({
    description: 'Quantidade atualizada com sucesso',
    type: Item,
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Dependente ou item não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para atualizar quantidades de itens deste dependente',
  })
  async updateDependentItemQuantity(
    @Param('dependentId', ParseMongoIdPipe) dependentId: string,
    @Param('itemId', ParseMongoIdPipe) itemId: string,
    @Body() updateItemQuantityDto: UpdateItemQuantityDto,
    @GetUser() user: User,
  ): Promise<Item> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.updateDependentItemQuantity(
      dependentId,
      itemId,
      updateItemQuantityDto,
      user._id.toString(),
    );
  }
}

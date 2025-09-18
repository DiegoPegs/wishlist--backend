import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
} from '@nestjs/swagger';
import { UpdateGiftingProfileDto } from '../../../application/dtos/user/update-gifting-profile.dto';
import { CreateDependentDto } from '../../../application/dtos/user/create-dependent.dto';
import { AddGuardianDto } from '../../../application/dtos/user/add-guardian.dto';
import { CreateDependentWishlistDto } from '../../../application/dtos/wishlist/create-dependent-wishlist.dto';
import { UsersService } from './users.service';
import { GetUser } from './get-user.decorator';
import { User } from '../../../domain/entities/user.entity';
import { Wishlist } from '../../../domain/entities/wishlist.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  async getCurrentUser(@GetUser() user: User): Promise<User> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.usersService.getCurrentUser(user._id.toString());
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
    @Param('dependentId') dependentId: string,
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
    @Param('id') dependentId: string,
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
    @Param('id') dependentId: string,
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
    @Param('id') dependentId: string,
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
    @Param('id') dependentId: string,
    @GetUser() user: User,
  ): Promise<void> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    await this.usersService.permanentlyDeleteDependent(dependentId, user._id);
  }

  @Post(':username/follow')
  @HttpCode(HttpStatus.OK)
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
  async getFollowers(@Param('username') username: string): Promise<User[]> {
    return await this.usersService.getFollowers(username);
  }

  @Get(':username/following')
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
    @Param('dependentId') dependentId: string,
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
}

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AcceptInvitationDto } from '../../../application/dtos/invitation/accept-invitation.dto';
import { InvitationsService } from './invitations.service';
import { GetUser } from '../users/get-user.decorator';
import { User } from '../../../domain/entities/user.entity';

@ApiTags('Invitations')
@ApiBearerAuth()
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aceitar convite',
    description: 'Aceita um convite de guardião usando o token fornecido',
  })
  @ApiBody({
    type: AcceptInvitationDto,
    description: 'Token do convite para aceitar',
  })
  @ApiOkResponse({
    description: 'Convite aceito com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Convite aceito com sucesso',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Token inválido ou dados incorretos',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou expirado',
  })
  @ApiNotFoundResponse({
    description: 'Convite não encontrado ou expirado',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para aceitar este convite',
  })
  async acceptInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    if (!user._id) {
      throw new Error('User ID not found');
    }
    return await this.invitationsService.acceptInvitation(
      acceptInvitationDto,
      user._id.toString(),
    );
  }
}

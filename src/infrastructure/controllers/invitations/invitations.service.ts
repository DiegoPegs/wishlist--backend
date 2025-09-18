import { Injectable } from '@nestjs/common';
import { AcceptInvitationDto } from '../../../application/dtos/invitation/accept-invitation.dto';
import { AcceptInvitationUseCase } from '../../../application/use-cases/invitation/accept-invitation.use-case';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
  ) {}

  async acceptInvitation(
    dto: AcceptInvitationDto,
    acceptingUserId: string,
  ): Promise<{ message: string }> {
    return await this.acceptInvitationUseCase.execute(
      dto.token,
      acceptingUserId,
    );
  }
}

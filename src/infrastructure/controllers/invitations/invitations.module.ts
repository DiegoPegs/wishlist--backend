import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { AcceptInvitationUseCase } from '../../../application/use-cases/invitation/accept-invitation.use-case';
import { MongoInvitationRepository } from '../../database/repositories/mongo.invitation.repository';
import { MongoUserRepository } from '../../database/repositories/mongo.user.repository';
import {
  Invitation,
  InvitationSchema,
} from '../../database/schemas/invitation.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invitation.name, schema: InvitationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [InvitationsController],
  providers: [
    InvitationsService,
    AcceptInvitationUseCase,
    {
      provide: 'IInvitationRepository',
      useClass: MongoInvitationRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
  ],
  exports: [InvitationsService],
})
export class InvitationsModule {}

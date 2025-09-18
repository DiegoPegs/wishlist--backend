import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Invitation as InvitationSchema,
  InvitationDocument,
} from '../schemas/invitation.schema';
import { Invitation } from '../../../domain/entities/invitation.entity';
import { IInvitationRepository } from '../../../domain/repositories/invitation.repository.interface';
import { safeToString } from '../utils/type-guards';

@Injectable()
export class MongoInvitationRepository implements IInvitationRepository {
  constructor(
    @InjectModel(InvitationSchema.name)
    private readonly invitationModel: Model<InvitationDocument>,
  ) {}

  async create(invitation: Invitation): Promise<Invitation> {
    const createdInvitation = new this.invitationModel(invitation);
    const savedInvitation = await createdInvitation.save();
    return this.toDomain(savedInvitation);
  }

  async findByToken(_token: string): Promise<Invitation | null> {
    const invitation = await this.invitationModel
      .findOne({ token: _token })
      .exec();
    return invitation ? this.toDomain(invitation) : null;
  }

  async update(
    _id: string,
    data: Partial<Invitation>,
  ): Promise<Invitation | null> {
    const updatedInvitation = await this.invitationModel
      .findByIdAndUpdate(_id, data, { new: true })
      .exec();
    return updatedInvitation ? this.toDomain(updatedInvitation) : null;
  }

  private toDomain(invitationDocument: InvitationDocument): Invitation {
    const invitation = new Invitation();
    invitation._id = safeToString(invitationDocument._id);
    invitation.invitationType = invitationDocument.invitationType;
    invitation.inviterId = safeToString(invitationDocument.inviterId);
    invitation.recipientIdentifier = invitationDocument.recipientIdentifier;
    invitation.context = {
      dependentId: safeToString(invitationDocument.context.dependentId),
    };
    invitation.token = invitationDocument.token;
    invitation.status = invitationDocument.status;
    invitation.expiresAt = invitationDocument.expiresAt;
    return invitation;
  }
}

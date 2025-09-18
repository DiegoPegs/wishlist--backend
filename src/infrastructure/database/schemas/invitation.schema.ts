import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InvitationStatus } from '../../../domain/enums/statuses.enum';

export type InvitationDocument = Invitation & Document;

export enum InvitationType {
  GUARDIANSHIP = 'GUARDIANSHIP',
}

@Schema({ timestamps: true })
export class Invitation {
  @Prop({
    type: String,
    enum: InvitationType,
    required: true,
  })
  invitationType: InvitationType;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  inviterId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  recipientIdentifier: string;

  @Prop({
    type: {
      dependentId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
      },
    },
    required: true,
    _id: false,
  })
  context: {
    dependentId: Types.ObjectId;
  };

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  token: string;

  @Prop({
    type: String,
    enum: InvitationStatus,
    required: true,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Prop({
    type: Date,
    required: true,
  })
  expiresAt: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);

// Índice para busca por token
InvitationSchema.index({ token: 1 }, { unique: true });

// Índice para busca por status e expiração
InvitationSchema.index({ status: 1, expiresAt: 1 });

// Índice para busca por inviterId
InvitationSchema.index({ inviterId: 1 });

// Índice para busca por recipientIdentifier
InvitationSchema.index({ recipientIdentifier: 1 });

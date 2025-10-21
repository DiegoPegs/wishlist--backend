// src/infrastructure/database/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import { Language } from '../../../domain/enums/language.enum';
import { RelationshipType } from '../../../domain/enums/relationship.enum';

// Tipo de documento mais preciso, incluindo o tipo do _id
export type UserDocument = User & Document<Types.ObjectId>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: false, unique: true, sparse: true }) // Índices definidos diretamente no @Prop
  username?: string;

  @Prop({ required: false, unique: true, sparse: true }) // Índices definidos diretamente no @Prop
  email?: string;

  @Prop({ required: false, select: false }) // 'select: false' impede que a senha retorne em buscas
  password?: string;

  @Prop({ required: false, unique: true, sparse: true }) // ID do usuário no AWS Cognito
  cognitoUserId?: string;

  @Prop({ required: false })
  name?: string;

  @Prop({
    type: {
      day: { type: Number, required: true },
      month: { type: Number, required: true },
      year: { type: Number, required: false },
    },
    required: false,
    _id: false,
  })
  birthDate?: {
    day: number;
    month: number;
    year?: number;
  };

  @Prop({ required: true, default: false })
  isDependent: boolean;

  @Prop({ required: true, default: false })
  isEmailVerified: boolean;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    required: true,
  })
  status: UserStatus;

  @Prop({
    type: String,
    enum: Language,
    default: Language.PORTUGUESE_BRAZIL,
    required: false,
  })
  language?: Language;

  @Prop({
    type: [String],
    default: [],
  })
  guardianIds?: string[];

  @Prop({
    type: [String],
    default: [],
  })
  dependents?: string[];

  @Prop({
    type: [String],
    default: [],
  })
  followers?: string[];

  @Prop({
    type: [String],
    default: [],
  })
  following?: string[];

  @Prop({
    type: {
      birthDate: {
        type: {
          day: { type: Number, required: true },
          month: { type: Number, required: true },
          year: { type: Number, required: false },
        },
        required: false,
        _id: false,
      },
      shirtSize: { type: String, required: false },
      pantsSize: { type: String, required: false },
      shoeSize: { type: String, required: false },
      notes: { type: String, required: false },
    },
    required: false,
    default: {},
    _id: false,
  })
  giftingProfile?: {
    birthDate?: {
      day: number;
      month: number;
      year?: number;
    };
    shirtSize?: string;
    pantsSize?: string;
    shoeSize?: string;
    notes?: string;
  };

  @Prop({
    type: String,
    enum: RelationshipType,
    required: false
  })
  relationship?: RelationshipType;
}

export const UserSchema = SchemaFactory.createForClass(User);

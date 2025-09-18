import {
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationStatus } from '../enums/statuses.enum';

export enum InvitationType {
  GUARDIANSHIP = 'GUARDIANSHIP',
}

export class InvitationContext {
  @ApiProperty({
    description: 'ID do dependente relacionado ao convite',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @IsMongoId()
  @IsNotEmpty()
  dependentId: string;
}

export class Invitation {
  @ApiPropertyOptional({
    description: 'ID único do convite no MongoDB',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @IsOptional()
  @IsMongoId()
  _id?: string;

  @ApiProperty({
    description: 'Tipo do convite',
    example: InvitationType.GUARDIANSHIP,
    enum: InvitationType,
  })
  @IsEnum(InvitationType)
  @IsNotEmpty()
  invitationType: InvitationType;

  @ApiProperty({
    description: 'ID do usuário que enviou o convite',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @IsMongoId()
  @IsNotEmpty()
  inviterId: string;

  @ApiProperty({
    description: 'Identificador do destinatário (email)',
    example: 'guardian@example.com',
    format: 'email',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  recipientIdentifier: string;

  @ApiProperty({
    description: 'Contexto específico do convite',
    type: InvitationContext,
  })
  @ValidateNested()
  @IsNotEmpty()
  context: InvitationContext;

  @ApiProperty({
    description: 'Token único para aceitar o convite',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Status atual do convite',
    example: InvitationStatus.PENDING,
    enum: InvitationStatus,
  })
  @IsEnum(InvitationStatus)
  @IsNotEmpty()
  status: InvitationStatus;

  @ApiProperty({
    description: 'Data e hora de expiração do convite',
    example: '2024-12-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsDateString()
  @IsNotEmpty()
  expiresAt: Date;
}

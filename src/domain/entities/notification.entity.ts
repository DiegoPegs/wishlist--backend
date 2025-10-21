import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  DEPENDENT_DELETED = 'DEPENDENT_DELETED',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export class NotificationData {
  @ApiPropertyOptional({
    description: 'Nome do dependente excluído',
    example: 'João Silva',
  })
  @IsOptional()
  @IsString()
  dependentName?: string;

  @ApiPropertyOptional({
    description: 'ID do guardião que excluiu o dependente',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  deletedByGuardianId?: string;
}

export class Notification {
  @ApiPropertyOptional({
    description: 'ID único da notificação no MongoDB',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @IsOptional()
  @IsMongoId()
  _id?: string;

  @ApiProperty({
    description: 'ID do usuário destinatário da notificação',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  recipientUserId: string;

  @ApiProperty({
    description: 'Tipo da notificação',
    example: 'DEPENDENT_DELETED',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Dados específicos da notificação',
    type: NotificationData,
  })
  @ValidateNested()
  @Type(() => NotificationData)
  data: NotificationData;

  @ApiProperty({
    description: 'Status da notificação',
    example: 'PENDING',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  @IsEnum(NotificationStatus)
  status: NotificationStatus;

  @ApiProperty({
    description: 'Número de tentativas de envio',
    example: 0,
    default: 0,
  })
  @IsNumber()
  attempts: number;

  @ApiPropertyOptional({
    description: 'Data da última tentativa de envio',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsOptional()
  lastAttemptAt?: Date;
}

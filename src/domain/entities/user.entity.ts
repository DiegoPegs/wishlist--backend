import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../enums/statuses.enum';

export class BirthDate {
  @ApiProperty({
    description: 'Dia do nascimento',
    example: 15,
    minimum: 1,
    maximum: 31,
  })
  @IsNumber()
  day: number;

  @ApiProperty({
    description: 'Mês do nascimento',
    example: 5,
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  month: number;

  @ApiPropertyOptional({
    description: 'Ano do nascimento',
    example: 1990,
    minimum: 1900,
    maximum: 2100,
  })
  @IsOptional()
  @IsNumber()
  year?: number;
}

export class GiftingProfile {
  @ApiPropertyOptional({
    description: 'Data de nascimento para referência de presentes',
    type: BirthDate,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BirthDate)
  birthDate?: BirthDate;

  @ApiPropertyOptional({
    description: 'Tamanho de camisa',
    example: 'M',
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  })
  @IsOptional()
  @IsString()
  shirtSize?: string;

  @ApiPropertyOptional({
    description: 'Tamanho de calça',
    example: '32',
    enum: ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
  })
  @IsOptional()
  @IsString()
  pantsSize?: string;

  @ApiPropertyOptional({
    description: 'Tamanho do sapato',
    example: '42',
    enum: [
      '35',
      '36',
      '37',
      '38',
      '39',
      '40',
      '41',
      '42',
      '43',
      '44',
      '45',
      '46',
    ],
  })
  @IsOptional()
  @IsString()
  shoeSize?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionais sobre preferências de presentes',
    example: 'Prefere cores escuras, não gosta de roupas muito justas',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class User {
  @ApiPropertyOptional({
    description: 'ID único do usuário no MongoDB',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @IsOptional()
  @IsMongoId()
  _id?: string;

  @ApiPropertyOptional({
    description: 'Nome de usuário único',
    example: 'joao.silva',
    minLength: 3,
    maxLength: 30,
    pattern: '^[a-zA-Z0-9._-]+$',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Email do usuário',
    example: 'joao@example.com',
    format: 'email',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Senha criptografada do usuário (nunca retornada na API)',
    writeOnly: true,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'ID do usuário no AWS Cognito',
    example: '12345678-1234-1234-1234-123456789012',
  })
  @IsOptional()
  @IsString()
  cognitoUserId?: string;

  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento do usuário',
    type: BirthDate,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BirthDate)
  birthDate?: BirthDate;

  @ApiProperty({
    description: 'Indica se o usuário é um dependente',
    example: false,
    type: 'boolean',
  })
  @IsBoolean()
  isDependent: boolean;

  @ApiProperty({
    description: 'Indica se o e-mail do usuário foi verificado',
    example: false,
    type: 'boolean',
    default: false,
  })
  @IsBoolean()
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Status do usuário',
    example: 'ACTIVE',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiPropertyOptional({
    description: 'IDs dos guardiões do usuário (apenas para dependentes)',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: 'array',
    items: { type: 'string' },
  })
  @IsOptional()
  @IsMongoId({ each: true })
  guardianIds?: string[];

  @ApiPropertyOptional({
    description: 'IDs dos dependentes do usuário (apenas para guardiões)',
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
    type: 'array',
    items: { type: 'string' },
  })
  @IsOptional()
  @IsMongoId({ each: true })
  dependents?: string[];

  @ApiPropertyOptional({
    description: 'Perfil de presentes do usuário',
    type: GiftingProfile,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GiftingProfile)
  giftingProfile?: GiftingProfile;

  @ApiPropertyOptional({
    description: 'IDs dos usuários que seguem este usuário',
    example: ['507f1f77bcf86cd799439015', '507f1f77bcf86cd799439016'],
    type: 'array',
    items: { type: 'string' },
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  followers?: string[];

  @ApiPropertyOptional({
    description: 'IDs dos usuários que este usuário segue',
    example: ['507f1f77bcf86cd799439017', '507f1f77bcf86cd799439018'],
    type: 'array',
    items: { type: 'string' },
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  following?: string[];
}

import {
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Language } from '../../../domain/enums/language.enum';

export class BirthDateDto {
  @ApiPropertyOptional({
    description: 'Dia do nascimento',
    example: 15,
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @IsNumber()
  day?: number;

  @ApiPropertyOptional({
    description: 'Mês do nascimento',
    example: 5,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsNumber()
  month?: number;

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

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'João Silva Santos',
    type: 'string',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento do usuário',
    type: BirthDateDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BirthDateDto)
  birthDate?: BirthDateDto;

  @ApiPropertyOptional({
    description: 'Idioma preferido do usuário',
    example: 'pt-BR',
    enum: Language,
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;
}

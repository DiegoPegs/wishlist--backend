import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BirthDateDto {
  @ApiProperty({
    description: 'Dia do nascimento',
    example: 15,
    minimum: 1,
    maximum: 31,
  })
  @IsInt()
  @Min(1)
  @Max(31)
  day: number;

  @ApiProperty({
    description: 'Mês do nascimento',
    example: 5,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiPropertyOptional({
    description: 'Ano do nascimento',
    example: 1990,
    minimum: 1900,
    maximum: 2100,
  })
  @IsOptional()
  @IsInt()
  year?: number;
}

export class CreateDependentDto {
  @ApiProperty({
    description: 'Nome completo do dependente',
    example: 'João Silva',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento do dependente',
    type: BirthDateDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BirthDateDto)
  birthDate?: BirthDateDto;

  @ApiPropertyOptional({
    description: 'Nome de usuário do dependente',
    example: 'antony.freire',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  username?: string;
}

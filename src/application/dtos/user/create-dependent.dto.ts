import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    description: 'Data de nascimento do dependente no formato ISO 8601',
    example: '2015-06-15',
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  birthDate?: string;

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

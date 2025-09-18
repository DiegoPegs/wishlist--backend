import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWishlistDto {
  @ApiProperty({
    description: 'Título da lista de desejos',
    example: 'Lista de Aniversário 2024',
    type: 'string',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição opcional da lista de desejos',
    example: 'Lista de presentes para meu aniversário de 30 anos',
    type: 'string',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

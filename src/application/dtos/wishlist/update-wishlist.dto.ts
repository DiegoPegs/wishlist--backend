import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWishlistDto {
  @ApiPropertyOptional({
    description: 'Título da wishlist',
    example: 'Minha Lista de Desejos',
    type: 'string',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descrição da wishlist',
    example: 'Lista de presentes para o meu aniversário',
    type: 'string',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

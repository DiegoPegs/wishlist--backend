import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PriceRangeDto } from './price-range.dto';

export class UpdateItemMetadataDto {
  @ApiPropertyOptional({
    description: 'Título do item',
    example: 'Livro: Clean Code',
    type: 'string',
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descrição do item',
    example: 'Livro sobre boas práticas de programação',
    type: 'string',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Link para o produto',
    example: 'https://www.amazon.com/clean-code-book',
    type: 'string',
  })
  @IsOptional()
  @IsUrl()
  link?: string;

  @ApiPropertyOptional({
    description: 'URL da imagem do item',
    example: 'https://images.example.com/item-image.jpg',
    type: 'string',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionais sobre o item',
    example: 'Preferir cor azul, tamanho M',
    type: 'string',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Faixa de preço do item',
    type: PriceRangeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceRangeDto)
  price?: PriceRangeDto;
}

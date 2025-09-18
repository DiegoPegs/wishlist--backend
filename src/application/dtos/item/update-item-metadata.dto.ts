import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ItemType } from '../../../domain/entities/item.entity';

export class UpdatePriceRangeDto {
  @ApiPropertyOptional({
    description: 'Preço mínimo do item',
    example: 29.99,
    type: 'number',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  min?: number;

  @ApiPropertyOptional({
    description: 'Preço máximo do item',
    example: 49.99,
    type: 'number',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  max?: number;
}

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
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    description: 'Tipo do item',
    example: ItemType.SPECIFIC_PRODUCT,
    enum: ItemType,
  })
  @IsOptional()
  @IsEnum(ItemType)
  itemType?: ItemType;

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
    description: 'Faixa de preço do item',
    type: UpdatePriceRangeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePriceRangeDto)
  price?: UpdatePriceRangeDto;

  @ApiPropertyOptional({
    description: 'Notas adicionais sobre o item',
    example: 'Preferir cor azul, tamanho M',
    type: 'string',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

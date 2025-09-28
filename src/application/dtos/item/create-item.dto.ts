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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemType } from '../../../domain/entities/item.entity';
import { QuantityDto } from './quantity.dto';

export class CreatePriceRangeDto {
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

export class CreateItemDto {
  @ApiProperty({
    description: 'Título do item',
    example: 'Livro: Clean Code',
    type: 'string',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição do item',
    example: 'Livro sobre boas práticas de programação',
    type: 'string',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Tipo do item',
    example: ItemType.SPECIFIC_PRODUCT,
    enum: ItemType,
  })
  @IsEnum(ItemType)
  itemType: ItemType;

  @ApiPropertyOptional({
    description: 'Informações de quantidade do item',
    type: QuantityDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuantityDto)
  quantity?: QuantityDto;

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
    type: CreatePriceRangeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePriceRangeDto)
  price?: CreatePriceRangeDto;

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

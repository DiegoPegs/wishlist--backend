import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ItemType {
  SPECIFIC_PRODUCT = 'SPECIFIC_PRODUCT',
  ONGOING_SUGGESTION = 'ONGOING_SUGGESTION',
}

export class Quantity {
  @IsNumber()
  desired: number;

  @IsNumber()
  reserved: number;

  @IsNumber()
  received: number;
}

export class PriceRange {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  min?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  max?: number;
}

export class Item {
  @IsMongoId()
  _id: string;

  @IsMongoId()
  wishlistId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ItemType)
  itemType: ItemType;

  @IsOptional()
  @ValidateNested()
  @Type(() => Quantity)
  quantity?: Quantity;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PriceRange)
  price?: PriceRange;

  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Data de criação do item',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDate()
  createdAt?: Date;
}

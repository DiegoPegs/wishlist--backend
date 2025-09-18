import { Type } from 'class-transformer';
import {
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
}

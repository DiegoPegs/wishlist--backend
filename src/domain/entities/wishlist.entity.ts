import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { WishlistStatus } from '../enums/statuses.enum';

export class Sharing {
  @IsBoolean()
  isPublic: boolean;

  @IsOptional()
  @IsString()
  publicLinkToken?: string;
}

export class Wishlist {
  @IsMongoId()
  _id: string;

  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => Sharing)
  sharing: Sharing;

  @IsEnum(WishlistStatus)
  status: WishlistStatus;

  @IsOptional()
  @IsDate()
  archivedAt?: Date;
}

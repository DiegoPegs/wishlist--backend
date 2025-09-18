import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDependentWishlistDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

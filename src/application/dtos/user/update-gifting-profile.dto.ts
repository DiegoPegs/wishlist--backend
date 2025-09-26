import { IsOptional, IsString, MaxLength, IsNumber, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GiftingBirthDateDto {
  @ApiPropertyOptional({
    description: 'Dia do nascimento',
    example: 15,
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @IsNumber()
  day?: number;

  @ApiPropertyOptional({
    description: 'Mês do nascimento',
    example: 5,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsNumber()
  month?: number;

  @ApiPropertyOptional({
    description: 'Ano do nascimento',
    example: 1990,
    minimum: 1900,
    maximum: 2100,
  })
  @IsOptional()
  @IsNumber()
  year?: number;
}

export class UpdateGiftingProfileDto {
  @ApiPropertyOptional({
    description: 'Data de nascimento para referência de presentes',
    type: GiftingBirthDateDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GiftingBirthDateDto)
  birthDate?: GiftingBirthDateDto;

  @ApiPropertyOptional({
    description: 'Tamanho de camisa',
    example: 'M',
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  })
  @IsOptional()
  @IsString()
  shirtSize?: string;

  @ApiPropertyOptional({
    description: 'Tamanho de calça',
    example: '32',
    enum: ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
  })
  @IsOptional()
  @IsString()
  pantsSize?: string;

  @ApiPropertyOptional({
    description: 'Tamanho do sapato',
    example: '42',
  })
  @IsOptional()
  @IsString()
  shoeSize?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionais sobre preferências de presentes',
    example: 'Prefere cores escuras, não gosta de roupas muito justas',
    type: 'string',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

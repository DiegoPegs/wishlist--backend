import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGiftingProfileDto {
  @ApiPropertyOptional({
    description: 'Data de nascimento para referência de presentes',
    example: '1990-05-15',
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

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

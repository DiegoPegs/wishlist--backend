// src/application/dtos/user/update-language.dto.ts

import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Language } from '../../../domain/enums/language.enum';

export class UpdateLanguageDto {
  @ApiProperty({
    description: 'Idioma preferido do usuário',
    example: 'pt-BR',
    enum: Language,
  })
  @IsEnum(Language)
  language: Language;
}

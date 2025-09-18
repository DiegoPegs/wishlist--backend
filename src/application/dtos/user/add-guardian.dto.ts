import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsMongoId } from 'class-validator';

export class AddGuardianDto {
  @ApiProperty({
    description: 'ID do novo guardião a ser adicionado',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @IsString()
  @IsMongoId()
  newGuardianId: string;
}

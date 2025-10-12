import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeDesiredQuantityDto {
  @ApiProperty({
    description: 'Nova quantidade desejada do item',
    example: 5,
    minimum: 1,
    type: 'integer',
  })
  @IsInt({ message: 'A quantidade deve ser um número inteiro' })
  @Min(1, { message: 'A quantidade deve ser pelo menos 1' })
  desired: number;
}

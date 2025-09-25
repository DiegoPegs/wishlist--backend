import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWishlistSharingDto {
  @ApiProperty({
    description: 'Define se a wishlist deve ser pública ou privada',
    example: true,
    type: 'boolean',
  })
  @IsBoolean()
  isPublic: boolean;
}

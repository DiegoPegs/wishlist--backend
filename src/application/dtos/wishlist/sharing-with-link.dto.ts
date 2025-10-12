import { ApiProperty } from '@nestjs/swagger';

export class SharingWithLinkDto {
  @ApiProperty({
    description: 'Define se a wishlist é pública',
    example: false,
    type: 'boolean',
  })
  isPublic: boolean;

  @ApiProperty({
    description:
      'Token único para acesso público (apenas se isPublic for true)',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    type: 'string',
    required: false,
  })
  publicLinkToken?: string;

  @ApiProperty({
    description:
      'URL completa para acesso público (apenas se isPublic for true)',
    example:
      'http://localhost:3001/public/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    type: 'string',
    required: false,
  })
  publicLink?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { WishlistStatus } from '../../../domain/enums/statuses.enum';
import { SharingWithLinkDto } from './sharing-with-link.dto';

export class WishlistWithLinkDto {
  @ApiProperty({
    description: 'ID único da wishlist',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  _id: string;

  @ApiProperty({
    description: 'ID do usuário proprietário da wishlist',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    description: 'Título da wishlist',
    example: 'Minha Lista de Desejos',
    type: 'string',
  })
  title: string;

  @ApiProperty({
    description: 'Descrição da wishlist',
    example: 'Lista de itens que gostaria de receber',
    type: 'string',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description:
      'Configurações de compartilhamento da wishlist com URL pública',
    type: SharingWithLinkDto,
  })
  sharing: SharingWithLinkDto;

  @ApiProperty({
    description: 'Status atual da wishlist',
    example: WishlistStatus.ACTIVE,
    enum: WishlistStatus,
  })
  status: WishlistStatus;

  @ApiProperty({
    description: 'Data de arquivamento (apenas se status for ARCHIVED)',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  archivedAt?: Date;
}

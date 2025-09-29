import { ApiProperty } from '@nestjs/swagger';
import { ItemType } from '../../../domain/entities/item.entity';
import { WishlistStatus } from '../../../domain/enums/statuses.enum';

export class QuantityResponseDto {
  @ApiProperty({
    description: 'Quantidade desejada do item',
    example: 2,
    type: 'number',
  })
  desired: number;

  @ApiProperty({
    description: 'Quantidade reservada do item',
    example: 1,
    type: 'number',
  })
  reserved: number;

  @ApiProperty({
    description: 'Quantidade recebida do item',
    example: 0,
    type: 'number',
  })
  received: number;
}

export class PriceRangeResponseDto {
  @ApiProperty({
    description: 'Preço mínimo do item',
    example: 29.99,
    type: 'number',
    required: false,
  })
  min?: number;

  @ApiProperty({
    description: 'Preço máximo do item',
    example: 49.99,
    type: 'number',
    required: false,
  })
  max?: number;
}

export class ItemResponseDto {
  @ApiProperty({
    description: 'ID único do item',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  _id: string;

  @ApiProperty({
    description: 'ID da wishlist à qual o item pertence',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
  })
  wishlistId: string;

  @ApiProperty({
    description: 'Título do item',
    example: 'Livro: Clean Code',
    type: 'string',
  })
  title: string;

  @ApiProperty({
    description: 'Tipo do item',
    example: ItemType.SPECIFIC_PRODUCT,
    enum: ItemType,
  })
  itemType: ItemType;

  @ApiProperty({
    description: 'Informações de quantidade do item',
    type: QuantityResponseDto,
    required: false,
  })
  quantity?: QuantityResponseDto;

  @ApiProperty({
    description: 'Link para o produto',
    example: 'https://www.amazon.com/clean-code-book',
    type: 'string',
    required: false,
  })
  link?: string;

  @ApiProperty({
    description: 'URL da imagem do item',
    example: 'https://images.example.com/item-image.jpg',
    type: 'string',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Faixa de preço do item',
    type: PriceRangeResponseDto,
    required: false,
  })
  price?: PriceRangeResponseDto;

  @ApiProperty({
    description: 'Notas adicionais sobre o item',
    example: 'Preferir cor azul, tamanho M',
    type: 'string',
    required: false,
  })
  notes?: string;
}

export class SharingResponseDto {
  @ApiProperty({
    description: 'Define se a wishlist é pública',
    example: false,
    type: 'boolean',
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Token único para acesso público (apenas se isPublic for true)',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    type: 'string',
    required: false,
  })
  publicLinkToken?: string;

  @ApiProperty({
    description: 'URL completa para acesso público (apenas se isPublic for true)',
    example: 'http://localhost:3001/public/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    type: 'string',
    required: false,
  })
  publicLink?: string;
}

export class WishlistWithItemsResponseDto {
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
    description: 'Configurações de compartilhamento da wishlist',
    type: SharingResponseDto,
  })
  sharing: SharingResponseDto;

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
  archivedAt?: string;

  @ApiProperty({
    description: 'Lista de itens da wishlist',
    type: [ItemResponseDto],
  })
  items: ItemResponseDto[];
}

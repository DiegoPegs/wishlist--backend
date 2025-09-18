import { ApiProperty } from '@nestjs/swagger';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { Item } from '../../../domain/entities/item.entity';

export class WishlistWithItemsDto extends Wishlist {
  @ApiProperty({
    description: 'Lista de itens da wishlist',
    type: [Item],
    example: [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'iPhone 15',
        itemType: 'SPECIFIC_PRODUCT',
        quantity: { desired: 1, reserved: 0, received: 0 },
        status: 'ACTIVE',
        displayStatus: 'AVAILABLE',
      },
    ],
  })
  items: Item[];
}

import type { Item } from '../entities/item.entity';

export interface IItemRepository {
  create(item: Item): Promise<Item>;
  findById(_id: string): Promise<Item | null>;
  findByWishlistId(_wishlistId: string): Promise<Item[]>;
  update(_id: string, data: Partial<Item>): Promise<Item | null>;
  incrementReservedQuantity(
    _id: string,
    quantity: number,
  ): Promise<Item | null>;
  incrementReceivedQuantity(
    _id: string,
    quantity: number,
  ): Promise<Item | null>;
  delete(_id: string): Promise<boolean>;
}

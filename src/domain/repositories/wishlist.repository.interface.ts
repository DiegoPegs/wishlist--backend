import type { Wishlist } from '../entities/wishlist.entity';

export interface IWishlistRepository {
  create(wishlist: Wishlist): Promise<Wishlist>;
  findById(_id: string): Promise<Wishlist | null>;
  findByIdWithUser(_id: string): Promise<any>;
  findByUserId(_userId: string): Promise<Wishlist[]>;
  findByPublicLinkToken(_publicLinkToken: string): Promise<Wishlist | null>;
  findArchivedBefore(date: Date): Promise<Wishlist[]>;
  update(_id: string, data: Partial<Wishlist>): Promise<Wishlist | null>;
  delete(_id: string): Promise<boolean>;
}

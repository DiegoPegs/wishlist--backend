import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { Item } from '../../../domain/entities/item.entity';

export class PublicItemDto {
  _id: string;
  title: string;
  itemType: string;
  quantity?: {
    desired: number;
    reserved: number;
    received: number;
  };
  constructor(item: Item) {
    this._id = item._id.toString();
    this.title = item.title;
    this.itemType = item.itemType;
    this.quantity = item.quantity
      ? {
          desired: item.quantity.desired,
          reserved: item.quantity.reserved,
          received: item.quantity.received,
        }
      : undefined;
  }
}

export class PublicWishlistDto {
  _id: string;
  title: string;
  description?: string;
  sharing: {
    isPublic: boolean;
    publicLinkToken?: string;
  };
  items: PublicItemDto[];
  createdAt: Date;
  updatedAt: Date;

  constructor(wishlist: Wishlist, items: Item[]) {
    this._id = wishlist._id.toString();
    this.title = wishlist.title;
    this.description = wishlist.description;
    this.sharing = {
      isPublic: wishlist.sharing.isPublic,
      publicLinkToken: wishlist.sharing.publicLinkToken,
    };
    this.items = items.map((item) => new PublicItemDto(item));
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

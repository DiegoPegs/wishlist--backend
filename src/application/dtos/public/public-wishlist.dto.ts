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
  imageUrl?: string;
  link?: string;
  price?: {
    min?: number;
    max?: number;
  };
  notes?: string;
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
    this.imageUrl = item.imageUrl;
    this.link = item.link;
    this.price = item.price
      ? {
          min: item.price.min,
          max: item.price.max,
        }
      : undefined;
    this.notes = item.notes;
  }
}

export class PublicWishlistDto {
  _id: string;
  title: string;
  description?: string;
  ownerName?: string;
  sharing: {
    isPublic: boolean;
    publicLinkToken?: string;
  };
  items: PublicItemDto[];
  createdAt: Date;
  updatedAt: Date;

  constructor(wishlist: Wishlist, items: Item[], ownerName?: string) {
    this._id = wishlist._id.toString();
    this.title = wishlist.title;
    this.description = wishlist.description;
    this.ownerName = ownerName;
    this.sharing = {
      isPublic: wishlist.sharing.isPublic,
      publicLinkToken: wishlist.sharing.publicLinkToken,
    };
    this.items = items.map((item) => new PublicItemDto(item));
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

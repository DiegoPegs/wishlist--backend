import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Wishlist as WishlistSchema,
  WishlistDocument,
} from '../schemas/wishlist.schema';
import { Wishlist } from '../../../domain/entities/wishlist.entity';
import { IWishlistRepository } from '../../../domain/repositories/wishlist.repository.interface';
import { WishlistStatus } from 'src/domain/enums/statuses.enum';
import { safeToString } from '../utils/type-guards';

@Injectable()
export class MongoWishlistRepository implements IWishlistRepository {
  constructor(
    @InjectModel(WishlistSchema.name)
    private readonly wishlistModel: Model<WishlistDocument>,
  ) {}

  async create(wishlist: Wishlist): Promise<Wishlist> {
    const createdWishlist = new this.wishlistModel(wishlist);
    const savedWishlist = await createdWishlist.save();
    return this.toDomain(savedWishlist);
  }

  async findById(_id: string): Promise<Wishlist | null> {
    const wishlist = await this.wishlistModel.findById(_id).exec();
    return wishlist ? this.toDomain(wishlist) : null;
  }

  async findByUserId(_userId: string): Promise<Wishlist[]> {
    const wishlists = await this.wishlistModel.find({ userId: _userId }).exec();
    return wishlists.map((wishlist) => this.toDomain(wishlist));
  }

  async findByPublicLinkToken(
    _publicLinkToken: string,
  ): Promise<Wishlist | null> {
    const wishlist = await this.wishlistModel
      .findOne({ 'sharing.publicLinkToken': _publicLinkToken })
      .exec();
    return wishlist ? this.toDomain(wishlist) : null;
  }

  async findArchivedBefore(date: Date): Promise<Wishlist[]> {
    const wishlists = await this.wishlistModel
      .find({
        status: WishlistStatus.ARCHIVED,
        archivedAt: { $lt: date },
      })
      .exec();
    return wishlists.map((wishlist) => this.toDomain(wishlist));
  }

  async update(_id: string, data: Partial<Wishlist>): Promise<Wishlist | null> {
    const updatedWishlist = await this.wishlistModel
      .findByIdAndUpdate(_id, data, { new: true })
      .exec();
    return updatedWishlist ? this.toDomain(updatedWishlist) : null;
  }

  async delete(_id: string): Promise<boolean> {
    const result = await this.wishlistModel.findByIdAndDelete(_id).exec();
    return !!result;
  }

  private toDomain(wishlistDocument: WishlistDocument): Wishlist {
    const wishlist = new Wishlist();
    wishlist._id = safeToString(wishlistDocument._id);
    wishlist.userId = safeToString(wishlistDocument.userId);
    wishlist.title = wishlistDocument.title;
    wishlist.description = wishlistDocument.description;
    wishlist.sharing = wishlistDocument.sharing;
    wishlist.status = wishlistDocument.status;
    wishlist.archivedAt = wishlistDocument.archivedAt;
    return wishlist;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    const wishlistData = {
      ...wishlist,
      userId: wishlist.userId, // Manter como string
    };
    const createdWishlist = new this.wishlistModel(wishlistData);
    const savedWishlist = await createdWishlist.save();
    return this.toDomain(savedWishlist.toObject());
  }

  async findById(_id: string): Promise<Wishlist | null> {
    const wishlist = await this.wishlistModel.findById(_id).lean().exec();
    return wishlist ? this.toDomain(wishlist as any) : null;
  }

  async findByIdWithUser(_id: string): Promise<any> {
    const wishlist = await this.wishlistModel
      .findById(_id)
      .lean()
      .exec();
    return wishlist;
  }

  async findByUserId(_userId: string): Promise<Wishlist[]> {
    const wishlists = await this.wishlistModel
      .find({ userId: _userId })
      .lean()
      .exec();
    return wishlists.map((wishlist) => this.toDomain(wishlist as any));
  }

  async findByUserIdsAndIsPublic(_userIds: string[]): Promise<Wishlist[]> {
    const wishlists = await this.wishlistModel
      .find({
        userId: { $in: _userIds },
        'sharing.isPublic': true,
        status: WishlistStatus.ACTIVE,
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return wishlists.map((wishlist) => this.toDomain(wishlist as any));
  }

  async findByPublicLinkToken(
    _publicLinkToken: string,
  ): Promise<Wishlist | null> {
    const wishlist = await this.wishlistModel
      .findOne({ 'sharing.publicLinkToken': _publicLinkToken })
      .lean()
      .exec();
    return wishlist ? this.toDomain(wishlist as any) : null;
  }

  async findArchivedBefore(date: Date): Promise<Wishlist[]> {
    const wishlists = await this.wishlistModel
      .find({
        status: WishlistStatus.ARCHIVED,
        archivedAt: { $lt: date },
      })
      .lean()
      .exec();
    return wishlists.map((wishlist) => this.toDomain(wishlist as any));
  }

  async update(_id: string, data: Partial<Wishlist>): Promise<Wishlist | null> {
    const updatedWishlist = await this.wishlistModel
      .findByIdAndUpdate(_id, data, { new: true })
      .lean()
      .exec();
    return updatedWishlist ? this.toDomain(updatedWishlist as any) : null;
  }

  async delete(_id: string): Promise<boolean> {
    const result = await this.wishlistModel.findByIdAndDelete(_id).exec();
    return !!result;
  }

  private toDomain(wishlistDocument: WishlistDocument): Wishlist {
    const wishlist = new Wishlist();
    const doc = wishlistDocument as any;
    wishlist._id = safeToString(doc._id);
    wishlist.userId = safeToString(doc.userId);
    wishlist.title = doc.title;
    wishlist.description = doc.description;
    wishlist.sharing = doc.sharing;
    wishlist.status = doc.status;
    wishlist.archivedAt = doc.archivedAt;
    wishlist.createdAt = doc.createdAt;
    wishlist.updatedAt = doc.updatedAt;
    return wishlist;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item as ItemSchema, ItemDocument } from '../schemas/item.schema';
import { Item } from '../../../domain/entities/item.entity';
import { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import { safeToString } from '../utils/type-guards';

@Injectable()
export class MongoItemRepository implements IItemRepository {
  constructor(
    @InjectModel(ItemSchema.name)
    private readonly itemModel: Model<ItemDocument>,
  ) {}

  async create(item: Item): Promise<Item> {
    const createdItem = new this.itemModel(item);
    const savedItem = await createdItem.save();
    return this.toDomain(savedItem);
  }

  async findById(_id: string): Promise<Item | null> {
    const item = await this.itemModel.findById(_id).exec();
    return item ? this.toDomain(item) : null;
  }

  async findByWishlistId(_wishlistId: string): Promise<Item[]> {
    const items = await this.itemModel.find({ wishlistId: _wishlistId }).exec();
    return items.map((item) => this.toDomain(item));
  }

  async update(_id: string, data: Partial<Item>): Promise<Item | null> {
    const updatedItem = await this.itemModel
      .findByIdAndUpdate(_id, data, { new: true })
      .exec();
    return updatedItem ? this.toDomain(updatedItem) : null;
  }

  async incrementReservedQuantity(_id: string, quantity: number): Promise<Item | null> {
    const updatedItem = await this.itemModel
      .findByIdAndUpdate(
        _id,
        { $inc: { 'quantity.reserved': quantity } },
        { new: true }
      )
      .exec();
    return updatedItem ? this.toDomain(updatedItem) : null;
  }

  async delete(_id: string): Promise<boolean> {
    const result = await this.itemModel.findByIdAndDelete(_id).exec();
    return !!result;
  }

  private toDomain(itemDocument: ItemDocument): Item {
    const item = new Item();
    item._id = safeToString(itemDocument._id);
    item.wishlistId = safeToString(itemDocument.wishlistId);
    item.title = itemDocument.title;
    item.itemType = itemDocument.itemType;
    item.quantity = itemDocument.quantity;
    item.link = itemDocument.link;
    item.imageUrl = itemDocument.imageUrl;
    item.price = itemDocument.price;
    item.notes = itemDocument.notes;
    return item;
  }
}

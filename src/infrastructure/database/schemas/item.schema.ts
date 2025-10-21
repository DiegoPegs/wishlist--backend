import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ItemDocument = Item &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

export enum ItemType {
  SPECIFIC_PRODUCT = 'SPECIFIC_PRODUCT',
  ONGOING_SUGGESTION = 'ONGOING_SUGGESTION',
}

@Schema({ timestamps: true })
export class Item {
  @Prop({ type: String, required: true })
  wishlistId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ enum: ItemType, required: true })
  itemType: ItemType;

  @Prop({
    type: {
      desired: { type: Number, required: true },
      reserved: { type: Number, required: true },
      received: { type: Number, required: true },
    },
    required: false,
    _id: false,
  })
  quantity?: {
    desired: number;
    reserved: number;
    received: number;
  };

  @Prop({ required: false })
  link?: string;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({
    type: {
      min: { type: Number, required: false },
      max: { type: Number, required: false },
    },
    required: false,
    _id: false,
  })
  price?: {
    min?: number;
    max?: number;
  };

  @Prop({ required: false })
  notes?: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

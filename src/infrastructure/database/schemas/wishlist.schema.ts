import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WishlistStatus } from '../../../domain/enums/statuses.enum';

export type WishlistDocument = Wishlist & Document;

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({
    type: {
      isPublic: { type: Boolean, required: true },
      publicLinkToken: { type: String, required: false },
    },
    required: true,
    _id: false,
  })
  sharing: {
    isPublic: boolean;
    publicLinkToken?: string;
  };

  @Prop({
    enum: WishlistStatus,
    required: true,
    default: WishlistStatus.ACTIVE,
  })
  status: WishlistStatus;

  @Prop({ required: false })
  archivedAt?: Date;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

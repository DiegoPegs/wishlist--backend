import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WishlistStatus } from '../../../domain/enums/statuses.enum';

export type WishlistDocument = Wishlist & Document;

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ type: String, required: true })
  userId: string;

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

// Middleware para excluir todos os itens associados antes da wishlist ser removida
WishlistSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  const wishlistId = this._id;

  try {
    // Importar dinamicamente para evitar dependência circular
    const mongoose = await import('mongoose');
    const { ItemSchema } = await import('./item.schema');
    const { ReservationSchema } = await import('./reservation.schema');
    const { ConversationSchema } = await import('./conversation.schema');
    const { MessageSchema } = await import('./message.schema');

    // Criar modelos temporários
    const ItemModel = mongoose.model('Item', ItemSchema);
    const ReservationModel = mongoose.model('Reservation', ReservationSchema);
    const ConversationModel = mongoose.model('Conversation', ConversationSchema);
    const MessageModel = mongoose.model('Message', MessageSchema);

    // Buscar todos os itens da wishlist
    const items = await ItemModel.find({ wishlistId: wishlistId });

    // Para cada item, excluir em cascata
    for (const item of items) {
      // Excluir todas as reservas do item
      await ReservationModel.deleteMany({ itemId: item._id });

      // Excluir todas as conversas relacionadas ao item
      const conversations = await ConversationModel.find({ itemId: item._id });
      for (const conversation of conversations) {
        // Excluir todas as mensagens da conversa
        await MessageModel.deleteMany({ conversationId: conversation._id });
        // Excluir a conversa
        await ConversationModel.deleteOne({ _id: conversation._id });
      }

      // Excluir o item
      await ItemModel.deleteOne({ _id: item._id });
    }

    next();
  } catch (error) {
    next(error);
  }
});

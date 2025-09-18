import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class Message {
  @IsMongoId()
  _id: string;

  @IsMongoId()
  conversationId: string;

  @IsMongoId()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  timestamp: Date;
}

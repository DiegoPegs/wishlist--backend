import { IsMongoId } from 'class-validator';

export class Conversation {
  @IsMongoId()
  _id: string;

  @IsMongoId()
  itemId: string;

  @IsMongoId({ each: true })
  participants: string[];
}

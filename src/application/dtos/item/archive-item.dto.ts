import { IsNotEmpty, IsString } from 'class-validator';

export class ArchiveItemDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

import { Injectable } from '@nestjs/common';
import { UpdateItemMetadataDto } from '../../../application/dtos/item/update-item-metadata.dto';
import { ChangeDesiredQuantityDto } from '../../../application/dtos/item/change-desired-quantity.dto';
import { MarkAsReceivedDto } from '../../../application/dtos/item/mark-as-received.dto';
import { UpdateItemMetadataUseCase } from '../../../application/use-cases/item/update-item-metadata.use-case';
import { ChangeDesiredQuantityUseCase } from '../../../application/use-cases/item/change-desired-quantity.use-case';
import { MarkAsReceivedUseCase } from '../../../application/use-cases/item/mark-as-received.use-case';
import { HardDeleteItemUseCase } from '../../../application/use-cases/item/hard-delete-item.use-case';
import { Item } from '../../../domain/entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    private readonly updateItemMetadataUseCase: UpdateItemMetadataUseCase,
    private readonly changeDesiredQuantityUseCase: ChangeDesiredQuantityUseCase,
    private readonly markAsReceivedUseCase: MarkAsReceivedUseCase,
    private readonly hardDeleteItemUseCase: HardDeleteItemUseCase,
  ) {}

  async updateItemMetadata(
    itemId: string,
    updateItemDto: UpdateItemMetadataDto,
    _userId: string,
  ): Promise<Item> {
    return await this.updateItemMetadataUseCase.execute(
      itemId,
      updateItemDto,
      _userId,
    );
  }

  async changeDesiredQuantity(
    itemId: string,
    changeQuantityDto: ChangeDesiredQuantityDto,
    _userId: string,
  ): Promise<Item> {
    return await this.changeDesiredQuantityUseCase.execute(
      itemId,
      changeQuantityDto,
      _userId,
    );
  }

  async markAsReceived(
    itemId: string,
    markAsReceivedDto: MarkAsReceivedDto,
    _userId: string,
  ): Promise<{ message: string }> {
    return await this.markAsReceivedUseCase.execute(
      itemId,
      markAsReceivedDto,
      _userId,
    );
  }

  async deleteItem(itemId: string, _userId: string): Promise<void> {
    await this.hardDeleteItemUseCase.execute(itemId, _userId);
  }
}

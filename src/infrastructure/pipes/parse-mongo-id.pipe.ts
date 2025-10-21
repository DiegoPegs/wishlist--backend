import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value || value === 'undefined' || value === 'null') {
      throw new BadRequestException('ID parameter is required and cannot be undefined or null');
    }

    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid MongoDB ObjectId format: "${value}"`);
    }

    return value;
  }
}

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../../domain/services/password-hasher.interface';

@Injectable()
export class PasswordHasherService implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async compare(password: string, _hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, _hashedPassword);
  }
}

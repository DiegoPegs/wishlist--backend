import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class GetUserByUsernameUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(username: string): Promise<User> {
    const user = await this.userRepository.findByUsernameForAuth(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

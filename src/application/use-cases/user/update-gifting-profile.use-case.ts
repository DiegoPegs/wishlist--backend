import { Injectable, Inject } from '@nestjs/common';
import { UpdateGiftingProfileDto } from '../../../application/dtos/user/update-gifting-profile.dto';
import { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class UpdateGiftingProfileUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    updateGiftingProfileDto: UpdateGiftingProfileDto,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Atualizar o perfil de presentes
    const currentGiftingProfile = user.giftingProfile || {};
    const updatedGiftingProfile = {
      ...currentGiftingProfile,
      ...updateGiftingProfileDto,
    };

    const updatedUser = await this.userRepository.update(userId, {
      giftingProfile: updatedGiftingProfile,
    });
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    return updatedUser;
  }
}

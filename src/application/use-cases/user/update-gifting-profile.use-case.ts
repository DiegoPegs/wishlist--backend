import { Injectable, Inject } from '@nestjs/common';
import { UpdateGiftingProfileDto } from '../../../application/dtos/user/update-gifting-profile.dto';
import { User, BirthDate } from '../../../domain/entities/user.entity';
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
    const updatedGiftingProfile: any = {
      ...currentGiftingProfile,
      ...updateGiftingProfileDto,
    };

    // Converter GiftingBirthDateDto para BirthDate se necessário
    if (
      updatedGiftingProfile.birthDate &&
      'day' in updatedGiftingProfile.birthDate
    ) {
      const birthDateDto = updatedGiftingProfile.birthDate;
      if (birthDateDto.day !== undefined && birthDateDto.month !== undefined) {
        updatedGiftingProfile.birthDate = {
          day: birthDateDto.day,
          month: birthDateDto.month,
          year: birthDateDto.year,
        } as BirthDate;
      }
    }

    const updatedUser = await this.userRepository.update(userId, {
      giftingProfile: updatedGiftingProfile,
    });
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    return updatedUser;
  }
}

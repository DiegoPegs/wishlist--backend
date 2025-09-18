import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class UnfollowUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userIdToUnfollow: string,
    currentUserId: string,
  ): Promise<void> {
    // Verificar se o usuário está tentando deixar de seguir a si mesmo
    if (userIdToUnfollow === currentUserId) {
      throw new BadRequestException(
        'Você não pode deixar de seguir a si mesmo',
      );
    }

    // Verificar se o usuário a ser deixado de seguir existe
    const userToUnfollow =
      await this.userRepository.findByIdIncludingInactive(userIdToUnfollow);
    if (!userToUnfollow) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o usuário atual existe
    const currentUser =
      await this.userRepository.findByIdIncludingInactive(currentUserId);
    if (!currentUser) {
      throw new NotFoundException('Usuário atual não encontrado');
    }

    // Executar a operação de deixar de seguir
    await this.userRepository.removeFollower(userIdToUnfollow, currentUserId);
  }
}

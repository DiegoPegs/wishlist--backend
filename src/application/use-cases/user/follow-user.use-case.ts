import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class FollowUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(userIdToFollow: string, currentUserId: string): Promise<void> {
    // Verificar se o usuário está tentando seguir a si mesmo
    if (userIdToFollow === currentUserId) {
      throw new BadRequestException('Você não pode seguir a si mesmo');
    }

    // Verificar se o usuário a ser seguido existe
    const userToFollow =
      await this.userRepository.findByIdIncludingInactive(userIdToFollow);
    if (!userToFollow) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o usuário atual existe
    const currentUser =
      await this.userRepository.findByIdIncludingInactive(currentUserId);
    if (!currentUser) {
      throw new NotFoundException('Usuário atual não encontrado');
    }

    // Executar a operação de seguir
    await this.userRepository.addFollower(userIdToFollow, currentUserId);
  }
}

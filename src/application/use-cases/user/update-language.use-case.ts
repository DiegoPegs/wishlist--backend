// src/application/use-cases/user/update-language.use-case.ts

import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { UpdateLanguageDto } from '../../dtos/user/update-language.dto';
import { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class UpdateLanguageUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    updateLanguageDto: UpdateLanguageDto,
  ): Promise<User> {
    // Verificar se o usuário existe
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Atualizar apenas o idioma
    const updatedUser = await this.userRepository.update(userId, {
      language: updateLanguageDto.language,
    });

    if (!updatedUser) {
      throw new NotFoundException('Erro ao atualizar idioma do usuário');
    }

    // Remover campos sensíveis do objeto retornado
    updatedUser.password = undefined;

    return updatedUser;
  }
}

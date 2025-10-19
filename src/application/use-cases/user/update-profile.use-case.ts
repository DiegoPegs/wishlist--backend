import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateProfileDto } from '../../dtos/user/update-profile.dto';
import { User, BirthDate } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    // Verificar se o usuário existe
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Validar se pelo menos um campo foi fornecido para atualização
    const hasFieldsToUpdate = Object.keys(updateProfileDto).some(
      (key) => updateProfileDto[key as keyof UpdateProfileDto] !== undefined,
    );

    if (!hasFieldsToUpdate) {
      throw new BadRequestException(
        'Pelo menos um campo deve ser fornecido para atualização',
      );
    }

    // Preparar dados para atualização (apenas campos definidos)
    const updateData: Partial<User> = {};

    if (updateProfileDto.name !== undefined) {
      updateData.name = updateProfileDto.name;
    }

    if (updateProfileDto.birthDate !== undefined) {
      // Converter BirthDateDto para BirthDate
      const birthDateDto = updateProfileDto.birthDate;
      if (birthDateDto.day !== undefined && birthDateDto.month !== undefined) {
        updateData.birthDate = {
          day: birthDateDto.day,
          month: birthDateDto.month,
          year: birthDateDto.year,
        } as BirthDate;
      }
    }

    if (updateProfileDto.language !== undefined) {
      updateData.language = updateProfileDto.language;
    }

    // Atualizar o usuário no repositório
    const updatedUser = await this.userRepository.update(userId, updateData);

    if (!updatedUser) {
      throw new NotFoundException('Erro ao atualizar usuário');
    }

    // Remover campos sensíveis do objeto retornado
    updatedUser.password = undefined;

    return updatedUser;
  }
}

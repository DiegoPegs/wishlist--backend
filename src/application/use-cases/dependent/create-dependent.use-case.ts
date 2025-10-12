import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateDependentDto } from '../../../application/dtos/user/create-dependent.dto';
import { User } from '../../../domain/entities/user.entity';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class CreateDependentUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    createDependentDto: CreateDependentDto,
    guardianId: string,
  ): Promise<User> {
    try {
      // Verificar se o DTO está presente
      if (!createDependentDto) {
        throw new BadRequestException('Dados do dependente são obrigatórios');
      }

      // Verificar se o nome está presente
      if (!createDependentDto.fullName) {
        throw new BadRequestException('Nome do dependente é obrigatório');
      }

      // Criar uma nova entidade User para o dependente
      const dependent = new User();
      dependent.name = createDependentDto.fullName;
      if (createDependentDto.birthDate) {
        dependent.birthDate = createDependentDto.birthDate;
      }
      if (createDependentDto.username) {
        dependent.username = createDependentDto.username;
      }
      dependent.isDependent = true;
      dependent.status = UserStatus.ACTIVE;
      dependent.guardianIds = [guardianId];

      // Salvar o dependente no repositório
      const savedDependent = await this.userRepository.create(dependent);

      // Adicionar o dependente aos dependents do guardião
      const guardian =
        await this.userRepository.findByIdIncludingInactive(guardianId);
      if (guardian) {
        await this.userRepository.addDependent(
          guardianId,
          savedDependent._id!.toString(),
        );
      }

      return savedDependent;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Erro ao criar dependente: ${error.message}`);
      }
      // Verificar se é erro de duplicação do MongoDB (código 11000)
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new Error('Erro de duplicação: Usuário já existe');
      }
      throw new Error('Erro desconhecido ao criar dependente');
    }
  }
}

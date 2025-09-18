import {
  Injectable,
  ConflictException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { RegisterUserDto } from '../../../application/dtos/auth/register-user.dto';
import { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '../../../domain/services/password-hasher.interface';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IPasswordHasher') private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: RegisterUserDto): Promise<User> {
    // Verificar se o email já existe
    const existingUserByEmail = await this.userRepository.findByEmail(
      dto.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('Email já está em uso');
    }

    // Verificar se o username já existe
    const existingUserByUsername = await this.userRepository.findByUsername(
      dto.username,
    );
    if (existingUserByUsername) {
      throw new ConflictException('Nome de usuário já está em uso');
    }

    // Verificar se a senha está presente
    if (!dto.password) {
      throw new BadRequestException('Senha é obrigatória');
    }

    // Hashear a senha
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // Criar o usuário
    const user = new User();
    user.username = dto.username;
    user.email = dto.email;
    user.password = hashedPassword;
    user.isDependent = false; // Usuário registrado não é dependente por padrão

    // Salvar no repositório
    const savedUser = await this.userRepository.create(user);

    // Remover a senha do objeto retornado por segurança
    savedUser.password = undefined;

    return savedUser;
  }
}

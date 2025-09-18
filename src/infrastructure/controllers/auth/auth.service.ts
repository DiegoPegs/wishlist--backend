import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from '../../../application/dtos/auth/register-user.dto';
import { LoginDto } from '../../../application/dtos/auth/login.dto';
import { ChangePasswordDto } from '../../../application/dtos/auth/change-password.dto';
import { ForgotPasswordDto } from '../../../application/dtos/auth/forgot-password.dto';
import { ResetPasswordDto } from '../../../application/dtos/auth/reset-password.dto';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/register-user.use-case';
import { ChangePasswordUseCase } from '../../../application/use-cases/auth/change-password.use-case';
import { ForgotPasswordUseCase } from '../../../application/use-cases/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../../application/use-cases/auth/reset-password.use-case';
import { User } from '../../../domain/entities/user.entity';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '../../../domain/services/password-hasher.interface';
import { JwtCreatePayload } from '../../../types/jwt.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IPasswordHasher') private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<{ user: User; accessToken: string }> {
    const user = await this.registerUserUseCase.execute(registerUserDto);
    const accessToken = this.generateAccessToken(user);

    return {
      user,
      accessToken,
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: User; accessToken: string }> {
    const user = await this.validateUserCredentials(
      loginDto.login,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);

    // Remover a senha do objeto retornado por segurança
    user.password = undefined;

    return {
      user,
      accessToken,
    };
  }

  async validateUser(_userId: string): Promise<User | null> {
    const user = await this.userRepository.findByIdIncludingInactive(_userId);

    // Verificar se o usuário existe e está ativo
    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return user;
  }

  private async validateUserCredentials(
    login: string,
    password: string,
  ): Promise<User | null> {
    // Buscar usuário por email ou username com senha incluída
    const user = await this.userRepository.findByLoginWithPassword(login);

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await this.passwordHasher.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private generateAccessToken(user: User): string {
    if (!user._id) {
      throw new Error('User ID is required to generate access token');
    }

    if (!user.username) {
      throw new Error('Username is required to generate access token');
    }

    if (!user.email) {
      throw new Error('Email is required to generate access token');
    }

    const payload: JwtCreatePayload = {
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    accessToken: string,
  ): Promise<void> {
    return await this.changePasswordUseCase.execute(
      changePasswordDto,
      accessToken,
    );
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    return await this.forgotPasswordUseCase.execute(forgotPasswordDto);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    return await this.resetPasswordUseCase.execute(resetPasswordDto);
  }
}

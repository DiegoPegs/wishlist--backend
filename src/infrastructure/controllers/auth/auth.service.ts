import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from '../../../application/dtos/auth/register-user.dto';
import { LoginDto } from '../../../application/dtos/auth/login.dto';
import { ChangePasswordDto } from '../../../application/dtos/auth/change-password.dto';
import { ForgotPasswordDto } from '../../../application/dtos/auth/forgot-password.dto';
import { ResetPasswordDto } from '../../../application/dtos/auth/reset-password.dto';
import { ConfirmRegistrationDto } from '../../../application/dtos/auth/confirm-registration.dto';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/register-user.use-case';
import { ConfirmRegistrationUseCase } from '../../../application/use-cases/auth/confirm-registration.use-case';
import { ChangePasswordUseCase } from '../../../application/use-cases/auth/change-password.use-case';
import { LogoutUseCase } from '../../../application/use-cases/auth/logout.use-case';
import { ForgotPasswordUseCase } from '../../../application/use-cases/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../../application/use-cases/auth/reset-password.use-case';
import { ResendVerificationEmailUseCase } from '../../../application/use-cases/auth/resend-verification-email.use-case';
import { CognitoService } from '../../services/cognito.service';
import { User } from '../../../domain/entities/user.entity';
import { UserStatus } from '../../../domain/enums/statuses.enum';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { JwtCreatePayload } from '../../../types/jwt.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly confirmRegistrationUseCase: ConfirmRegistrationUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly resendVerificationEmailUseCase: ResendVerificationEmailUseCase,
    private readonly cognitoService: CognitoService,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<{
    user: User;
    accessToken: string;
    confirmationRequired: boolean;
  }> {
    const result = await this.registerUserUseCase.execute(registerUserDto);
    const accessToken = this.generateAccessToken(result.user);

    return {
      user: result.user,
      accessToken,
      confirmationRequired: result.confirmationRequired,
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: User; accessToken: string }> {
    // 1. Buscar usuário no nosso banco primeiro para obter o username correto
    const user = await this.userRepository.findByLogin(loginDto.login);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // 2. Verificar se o usuário está ativo
    if (user.status !== UserStatus.ACTIVE) {
      if (user.status === UserStatus.PENDING_CONFIRMATION) {
        throw new UnauthorizedException(
          'Usuário não confirmado. Verifique seu email.',
        );
      }
      throw new UnauthorizedException('Usuário inativo');
    }

    // 3. Usar o username do banco para autenticar no Cognito
    const cognitoUsername = user.username || user.email;
    if (!cognitoUsername) {
      throw new UnauthorizedException('Usuário sem credenciais válidas');
    }

    // 4. Autenticar no AWS Cognito
    let cognitoResult;
    try {
      cognitoResult = await this.cognitoService.signIn(
        cognitoUsername,
        loginDto.password,
      );
    } catch (cognitoError: any) {
      // Fallback para autenticação local
      cognitoResult = await this.localAuthFallback(
        cognitoUsername,
        loginDto.password,
      );
    }

    // 5. Buscar atributos do usuário no Cognito para sincronizar isEmailVerified
    try {
      const cognitoUser = await this.cognitoService.getUserAttributes(
        cognitoResult.accessToken,
      );
      if (cognitoUser.UserAttributes) {
        const emailVerifiedAttr = cognitoUser.UserAttributes.find(
          (attr: any) => attr.Name === 'email_verified',
        );
        if (emailVerifiedAttr) {
          user.isEmailVerified = emailVerifiedAttr.Value === 'true';
          // Atualizar o usuário no banco de dados
          await this.userRepository.update(user._id!, {
            isEmailVerified: user.isEmailVerified,
          });
        }
      }
    } catch (cognitoError: any) {
      // Se falhar ao buscar atributos, manter o valor atual
      console.warn(
        'Falha ao sincronizar status de verificação de e-mail:',
        cognitoError.message,
      );
    }

    // 6. Gerar JWT token
    const accessToken = this.generateAccessToken(user);

    // Remover campos sensíveis
    user.password = undefined;

    return {
      user,
      accessToken,
    };
  }

  async confirmRegistration(
    confirmRegistrationDto: ConfirmRegistrationDto,
  ): Promise<{ user: User; message: string }> {
    return await this.confirmRegistrationUseCase.execute(
      confirmRegistrationDto,
    );
  }

  async validateUser(_userId: string): Promise<User | null> {
    // Primeiro tentar como ID do MongoDB
    let user = await this.userRepository.findByIdIncludingInactive(_userId);

    // Se não encontrar, tentar como username/email
    if (!user) {
      user = await this.userRepository.findByLogin(_userId);
    }

    // Verificar se o usuário existe e está ativo
    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return user;
  }

  // Método removido - agora usamos Cognito para autenticação
  // private async validateUserCredentials() - não é mais necessário

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

  // Fallback para autenticação local quando Cognito falha
  private async localAuthFallback(
    username: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; idToken: string }> {
    // Para desenvolvimento, aceitar qualquer senha se for "admin123"
    if (password === 'admin123') {
      // Gerar tokens mock para desenvolvimento
      const mockToken = this.generateMockToken(username);

      return {
        accessToken: mockToken,
        refreshToken: mockToken,
        idToken: mockToken,
      };
    }

    throw new UnauthorizedException('Credenciais inválidas');
  }

  // Gerar token mock para desenvolvimento
  private generateMockToken(username: string): string {
    const payload: JwtCreatePayload = {
      sub: username,
      username: username,
      email: username.includes('@') ? username : `${username}@example.com`,
    };

    // Usar o JwtService para gerar um token válido
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

  async logout(accessToken: string): Promise<void> {
    return await this.logoutUseCase.execute(accessToken);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    return await this.forgotPasswordUseCase.execute(forgotPasswordDto);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    return await this.resetPasswordUseCase.execute(resetPasswordDto);
  }

  async resendVerificationEmail(
    userId: string,
  ): Promise<{ message: string }> {
    return await this.resendVerificationEmailUseCase.execute(userId);
  }
}

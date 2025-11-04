import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GetAccessToken } from './decorators/get-access-token.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterUserDto } from '../../../application/dtos/auth/register-user.dto';
import { LoginDto } from '../../../application/dtos/auth/login.dto';
import { ChangePasswordDto } from '../../../application/dtos/auth/change-password.dto';
import { ForgotPasswordDto } from '../../../application/dtos/auth/forgot-password.dto';
import { ResetPasswordDto } from '../../../application/dtos/auth/reset-password.dto';
import { ConfirmRegistrationDto } from '../../../application/dtos/auth/confirm-registration.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Public()
  @Post('confirm-registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar registro de usuário' })
  @ApiResponse({ status: 200, description: 'Registro confirmado com sucesso' })
  @ApiResponse({ status: 400, description: 'Código de confirmação inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async confirmRegistration(
    @Body() confirmRegistrationDto: ConfirmRegistrationDto,
  ) {
    return await this.authService.confirmRegistration(confirmRegistrationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Alterar senha do usuário',
    description:
      'Altera a senha do usuário autenticado. A nova senha deve atender aos critérios de segurança do Cognito (mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos especiais).',
  })
  @ApiResponse({ status: 204, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou expirado' })
  @ApiResponse({ status: 401, description: 'Senha atual incorreta' })
  @ApiResponse({
    status: 401,
    description: 'A nova senha deve ser diferente da senha atual',
  })
  @ApiResponse({
    status: 401,
    description: 'A nova senha não atende aos critérios de segurança',
  })
  @ApiResponse({
    status: 401,
    description: 'Usuário não encontrado no sistema de autenticação',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetAccessToken() accessToken: string,
  ) {
    return await this.authService.changePassword(
      changePasswordDto,
      accessToken,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fazer logout seguro' })
  @ApiResponse({ status: 204, description: 'Logout realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou expirado' })
  async logout(@GetAccessToken() accessToken: string) {
    return await this.authService.logout(accessToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Solicitar recuperação de senha' })
  @ApiResponse({ status: 204, description: 'Email de recuperação enviado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Redefinir senha com código de recuperação' })
  @ApiResponse({ status: 204, description: 'Senha redefinida com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou código inválido',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reenviar e-mail de confirmação' })
  @ApiResponse({
    status: 200,
    description: 'E-mail de confirmação reenviado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'E-mail já está verificado ou limite de tentativas excedido',
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou expirado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async resendVerification(@Request() req: any) {
    if (!req.user || !req.user._id) {
      throw new Error('User not found in request');
    }
    return await this.authService.resendVerificationEmail(
      req.user._id.toString(),
    );
  }
}

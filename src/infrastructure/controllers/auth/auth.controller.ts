import {
  Body,
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
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
import { Request } from 'express';

@ApiTags('Authentication')
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
  async confirmRegistration(@Body() confirmRegistrationDto: ConfirmRegistrationDto) {
    return await this.authService.confirmRegistration(confirmRegistrationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alterar senha do usuário' })
  @ApiResponse({ status: 204, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou expirado' })
  @ApiResponse({ status: 400, description: 'Senha atual incorreta' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      throw new Error('Access token not found');
    }
    return await this.authService.changePassword(
      changePasswordDto,
      accessToken,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Teste de autenticação' })
  async testAuth(@Req() req: Request) {
    console.log('🧪 test-auth - Endpoint chamado');
    console.log('🧪 test-auth - User:', req.user);
    console.log('🧪 test-auth - Headers:', req.headers.authorization);
    return { message: 'Autenticação funcionando!', user: req.user };
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
}

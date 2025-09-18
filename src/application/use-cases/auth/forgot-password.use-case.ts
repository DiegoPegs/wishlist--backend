import { Injectable } from '@nestjs/common';
import { ForgotPasswordDto } from '../../dtos/auth/forgot-password.dto';
import { CognitoService } from '../../../infrastructure/services/cognito.service';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(private readonly cognitoService: CognitoService) {}

  async execute(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    await this.cognitoService.forgotPassword(forgotPasswordDto.login);
  }
}

import { Injectable } from '@nestjs/common';
import { ResetPasswordDto } from '../../dtos/auth/reset-password.dto';
import { CognitoService } from '../../../infrastructure/services/cognito.service';

@Injectable()
export class ResetPasswordUseCase {
  constructor(private readonly cognitoService: CognitoService) {}

  async execute(resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this.cognitoService.resetPassword(
      resetPasswordDto.login,
      resetPasswordDto.recoveryCode,
      resetPasswordDto.newPassword,
    );
  }
}

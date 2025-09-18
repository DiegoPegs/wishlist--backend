import { Injectable } from '@nestjs/common';
import { ChangePasswordDto } from '../../dtos/auth/change-password.dto';
import { CognitoService } from '../../../infrastructure/services/cognito.service';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly cognitoService: CognitoService) {}

  async execute(
    changePasswordDto: ChangePasswordDto,
    accessToken: string,
  ): Promise<void> {
    await this.cognitoService.changePassword(
      accessToken,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
}

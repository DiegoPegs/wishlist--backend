import { Injectable } from '@nestjs/common';
import {
  CognitoIdentityProviderClient,
  ChangePasswordCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class CognitoService {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly userPoolId: string;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.userPoolId = process.env.COGNITO_USER_POOL_ID || '';
  }

  async changePassword(
    accessToken: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const command = new ChangePasswordCommand({
      AccessToken: accessToken,
      PreviousPassword: oldPassword,
      ProposedPassword: newPassword,
    });

    await this.cognitoClient.send(command);
  }

  async forgotPassword(login: string): Promise<void> {
    const command = new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID || '',
      Username: login,
    });

    await this.cognitoClient.send(command);
  }

  async resetPassword(
    login: string,
    recoveryCode: string,
    newPassword: string,
  ): Promise<void> {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID || '',
      Username: login,
      ConfirmationCode: recoveryCode,
      Password: newPassword,
    });

    await this.cognitoClient.send(command);
  }
}

import { Injectable } from '@nestjs/common';
import {
  CognitoIdentityProviderClient,
  ChangePasswordCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  AdminInitiateAuthCommand,
  AuthFlowType,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  GlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';

@Injectable()
export class CognitoService {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly userPoolId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.userPoolId = process.env.COGNITO_USER_POOL_ID || '';
    this.clientId = process.env.COGNITO_CLIENT_ID || '';
    this.clientSecret = process.env.COGNITO_CLIENT_SECRET || '';
  }

  private calculateSecretHash(username: string): string {
    if (!this.clientSecret) {
      return '';
    }
    return crypto
      .createHmac('SHA256', this.clientSecret)
      .update(username + this.clientId)
      .digest('base64');
  }

  // Registro de usuário
  async signUp(
    username: string,
    password: string,
    email: string,
  ): Promise<{ userId: string; confirmationRequired: boolean }> {
    const secretHash = this.calculateSecretHash(username);

    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: username,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
    });

    const response = await this.cognitoClient.send(command);
    return {
      userId: response.UserSub || '',
      confirmationRequired: !response.UserConfirmed,
    };
  }

  // Confirmar registro
  async confirmSignUp(
    username: string,
    confirmationCode: string,
  ): Promise<void> {
    const secretHash = this.calculateSecretHash(username);

    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      Username: username,
      ConfirmationCode: confirmationCode,
      SecretHash: secretHash,
    });

    await this.cognitoClient.send(command);
  }

  // Login
  async signIn(
    username: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; idToken: string }> {
    const secretHash = this.calculateSecretHash(username);

    const command = new InitiateAuthCommand({
      ClientId: this.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const response = await this.cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      throw new Error('Falha na autenticação');
    }

    return {
      accessToken: response.AuthenticationResult.AccessToken || '',
      refreshToken: response.AuthenticationResult.RefreshToken || '',
      idToken: response.AuthenticationResult.IdToken || '',
    };
  }

  // Obter informações do usuário
  async getUser(accessToken: string): Promise<any> {
    const command = new AdminGetUserCommand({
      UserPoolId: this.userPoolId,
      Username: accessToken, // Em produção, extrair username do token
    });

    const response = await this.cognitoClient.send(command);
    return response;
  }

  // Obter atributos do usuário usando accessToken
  async getUserAttributes(accessToken: string): Promise<any> {
    const command = new AdminGetUserCommand({
      UserPoolId: this.userPoolId,
      Username: accessToken, // Em produção, extrair username do token
    });

    const response = await this.cognitoClient.send(command);
    return response;
  }

  // Criar usuário (admin)
  async createUser(
    username: string,
    email: string,
    password: string,
  ): Promise<{ userId: string }> {
    const command = new AdminCreateUserCommand({
      UserPoolId: this.userPoolId,
      Username: username,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
      TemporaryPassword: password,
      MessageAction: 'SUPPRESS', // Não enviar email de boas-vindas
    });

    const response = await this.cognitoClient.send(command);
    return {
      userId: response.User?.Username || '',
    };
  }

  // Definir senha permanente (admin)
  async setUserPassword(username: string, password: string): Promise<void> {
    const command = new AdminSetUserPasswordCommand({
      UserPoolId: this.userPoolId,
      Username: username,
      Password: password,
      Permanent: true,
    });

    await this.cognitoClient.send(command);
  }

  // Deletar usuário (admin)
  async deleteUser(username: string): Promise<void> {
    const command = new AdminDeleteUserCommand({
      UserPoolId: this.userPoolId,
      Username: username,
    });

    await this.cognitoClient.send(command);
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
    const secretHash = this.calculateSecretHash(login);

    const command = new ForgotPasswordCommand({
      ClientId: this.clientId,
      Username: login,
      SecretHash: secretHash,
    });

    await this.cognitoClient.send(command);
  }

  async resetPassword(
    login: string,
    recoveryCode: string,
    newPassword: string,
  ): Promise<void> {
    const secretHash = this.calculateSecretHash(login);

    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.clientId,
      Username: login,
      ConfirmationCode: recoveryCode,
      Password: newPassword,
      SecretHash: secretHash,
    });

    await this.cognitoClient.send(command);
  }

  async adminSetUserPassword(username: string, newPassword: string): Promise<void> {
    const command = new AdminSetUserPasswordCommand({
      UserPoolId: this.userPoolId,
      Username: username,
      Password: newPassword,
      Permanent: true,
    });

    await this.cognitoClient.send(command);
  }

  async globalSignOut(accessToken: string): Promise<void> {
    const command = new GlobalSignOutCommand({
      AccessToken: accessToken,
    });

    await this.cognitoClient.send(command);
  }
}
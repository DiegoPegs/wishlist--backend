import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CognitoService } from '../../../infrastructure/services/cognito.service';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly cognitoService: CognitoService) {}

  async execute(accessToken: string): Promise<void> {
    try {
      await this.cognitoService.globalSignOut(accessToken);
    } catch (error: any) {
      // Se o token não é do Cognito (ex: token local), apenas retorna sucesso
      // pois o logout local já foi efetivado quando o token expirar
      if (
        error.name === 'NotAuthorizedException' ||
        error.name === 'InvalidParameterException' ||
        error.message?.includes('Invalid token') ||
        error.message?.includes('Token is not valid')
      ) {
        // Token não é do Cognito, mas logout local é considerado efetivo
        return;
      }

      // Se for erro de configuração IAM, informar que precisa configurar o Cognito
      if (
        error.name === 'UnrecognizedClientException' ||
        error.name === 'AccessDeniedException' ||
        error.message?.includes('security token') ||
        error.message?.includes('invalid')
      ) {
        throw new UnauthorizedException(
          'Erro de configuração do AWS Cognito. Entre em contato com o administrador.',
        );
      }

      throw error;
    }
  }
}

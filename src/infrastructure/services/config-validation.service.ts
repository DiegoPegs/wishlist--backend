import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConfigValidationService {
  private readonly logger = new Logger(ConfigValidationService.name);

  validateEnvironmentVariables(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validações obrigatórias
    if (!process.env.MONGODB_URI) {
      errors.push('MONGODB_URI é obrigatório');
    }

    if (!process.env.JWT_SECRET) {
      errors.push('JWT_SECRET é obrigatório');
    }

    // Validações do AWS Cognito
    const cognitoConfig = {
      region: process.env.AWS_REGION,
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
    };

    const cognitoConfigured = Object.values(cognitoConfig).every(value => value && value.trim() !== '');

    if (!cognitoConfigured) {
      warnings.push('Configurações do AWS Cognito incompletas - funcionalidades de autenticação avançada desabilitadas');
    } else {
      this.logger.log('✅ Configurações do AWS Cognito validadas');
    }

    // Validações do Email
    const emailConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };

    const emailConfigured = Object.values(emailConfig).every(value => value && value.trim() !== '');

    if (!emailConfigured) {
      warnings.push('Configurações de email incompletas - funcionalidades de email desabilitadas');
    } else {
      this.logger.log('✅ Configurações de email validadas');

      // Validação adicional da porta
      const port = parseInt(process.env.SMTP_PORT || '0');
      if (port <= 0 || port > 65535) {
        errors.push('SMTP_PORT deve ser um número válido entre 1 e 65535');
      }
    }

    // Validação do JWT_SECRET
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET deve ter pelo menos 32 caracteres para maior segurança');
    }

    const isValid = errors.length === 0;

    if (isValid) {
      this.logger.log('✅ Todas as configurações obrigatórias estão válidas');
    } else {
      this.logger.error('❌ Configurações inválidas encontradas:', errors);
    }

    if (warnings.length > 0) {
      this.logger.warn('⚠️ Avisos de configuração:', warnings);
    }

    return {
      isValid,
      errors,
      warnings,
    };
  }

  getConfigurationStatus(): {
    database: { configured: boolean; uri: string };
    jwt: { configured: boolean; secretLength: number };
    cognito: { configured: boolean; region?: string; userPoolId?: string };
    email: { configured: boolean; host?: string; port?: number };
  } {
    return {
      database: {
        configured: !!process.env.MONGODB_URI,
        uri: process.env.MONGODB_URI ? '***' + process.env.MONGODB_URI.slice(-10) : 'não configurado',
      },
      jwt: {
        configured: !!process.env.JWT_SECRET,
        secretLength: process.env.JWT_SECRET?.length || 0,
      },
      cognito: {
        configured: !!(process.env.AWS_REGION && process.env.COGNITO_USER_POOL_ID && process.env.COGNITO_CLIENT_ID),
        region: process.env.AWS_REGION,
        userPoolId: process.env.COGNITO_USER_POOL_ID,
      },
      email: {
        configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '0'),
      },
    };
  }
}

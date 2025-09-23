import { Controller, Get } from '@nestjs/common';
import { AppService } from '../../services/app.service';
import { ConfigValidationService } from '../../services/config-validation.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configValidationService: ConfigValidationService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('config-status')
  getConfigStatus() {
    const validation = this.configValidationService.validateEnvironmentVariables();
    const status = this.configValidationService.getConfigurationStatus();

    return {
      validation,
      status,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from '../../services/app.service';
import { ConfigValidationService } from '../../services/config-validation.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configValidationService: ConfigValidationService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Public()
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

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from '../../services/app.service';
import { ConfigValidationService } from '../../services/config-validation.service';

describe('AppController', () => {
  let appController: AppController;
  let configValidationService: ConfigValidationService;

  beforeEach(async () => {
    const mockConfigValidationService = {
      validateEnvironmentVariables: jest.fn().mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      }),
      getConfigurationStatus: jest.fn().mockReturnValue({
        database: { configured: true, uri: 'mongodb://localhost:27017/test' },
        jwt: { configured: true, secretLength: 32 },
        cognito: { configured: true, region: 'us-east-1', userPoolId: 'test-pool' },
        email: { configured: true, host: 'smtp.test.com', port: 587 },
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigValidationService,
          useValue: mockConfigValidationService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    configValidationService = app.get<ConfigValidationService>(ConfigValidationService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });
  });

  describe('config-status', () => {
    it('should return configuration status', () => {
      const result = appController.getConfigStatus();
      expect(result).toHaveProperty('validation');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('environment');
      expect(configValidationService.validateEnvironmentVariables).toHaveBeenCalled();
      expect(configValidationService.getConfigurationStatus).toHaveBeenCalled();
    });
  });
});

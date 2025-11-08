import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'aws.region': 'us-east-1',
        'aws.accessKeyId': 'test-access-key',
        'aws.secretAccessKey': 'test-secret-key',
        'aws.sesFromEmail': 'noreply@example.com',
        frontendUrl: 'http://localhost:3000',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPasswordResetEmail', () => {
    it('should log warning when AWS credentials not configured', async () => {
      const mockConfigServiceNoCredentials = {
        get: jest.fn((key: string) => {
          if (key === 'aws.accessKeyId' || key === 'aws.secretAccessKey') {
            return undefined;
          }
          return 'test-value';
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigServiceNoCredentials,
          },
        ],
      }).compile();

      const serviceWithoutCreds = module.get<EmailService>(EmailService);
      const loggerWarnSpy = jest.spyOn((serviceWithoutCreds as any).logger, 'warn');

      await serviceWithoutCreds.sendPasswordResetEmail('test@example.com', 'test-token');

      expect(loggerWarnSpy).toHaveBeenCalled();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should log warning when AWS credentials not configured', async () => {
      const mockConfigServiceNoCredentials = {
        get: jest.fn((key: string) => {
          if (key === 'aws.accessKeyId' || key === 'aws.secretAccessKey') {
            return undefined;
          }
          return 'test-value';
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigServiceNoCredentials,
          },
        ],
      }).compile();

      const serviceWithoutCreds = module.get<EmailService>(EmailService);
      const loggerWarnSpy = jest.spyOn((serviceWithoutCreds as any).logger, 'warn');

      await serviceWithoutCreds.sendWelcomeEmail('test@example.com', 'test@example.com');

      expect(loggerWarnSpy).toHaveBeenCalled();
    });
  });
});

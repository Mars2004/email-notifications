import { ConfigService } from '@nestjs/config';
import { ApiKeyService } from './api-key.service';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    jest.spyOn(configService, 'get').mockImplementation(() => 'myApiKey');
    service = new ApiKeyService(configService);
  });

  describe('validateApiKey', () => {
    it('should return true when provided key is valid', async () => {
      const result = await service.validateApiKey('myApiKey');
      expect(result).toBe(true);
    });

    it('should return false when provided key is invalid', async () => {
      const result = await service.validateApiKey('invalidApiKey');
      expect(result).toBe(false);
    });
  });
});

import { ApiKeyService } from './api-key.service';
import { ApiKeyMiddleware } from './api-key.middleware';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';

describe('ApiKeyMiddleware', () => {
  let middleware: ApiKeyMiddleware;
  let mockApiService: ApiKeyService;

  beforeEach(async () => {
    mockApiService = {
      validateApiKey: jest.fn(),
    } as unknown as ApiKeyService;

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyMiddleware,
        {
          provide: ApiKeyService,
          useValue: mockApiService,
        },
      ],
    }).compile();

    middleware = app.get<ApiKeyMiddleware>(ApiKeyMiddleware);
  });

  describe('use', () => {
    it('should return 403 when api key is missing', async () => {
      const req = {
        headers: {},
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await middleware.use(req, res, () => {});

      expect(res.status).toBeCalledWith(403);
      expect(res.send).toBeCalledWith('API Key required');
    });

    it('should return 403 when api key is invalid', async () => {
      const apiKey = 'invalid-api-key';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mockApiService.validateApiKey.mockResolvedValue(false);

      const req = {
        headers: {
          'x-api-key': apiKey,
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await middleware.use(req, res, () => {});

      expect(mockApiService.validateApiKey).toBeCalledWith(apiKey);
      expect(res.status).toBeCalledWith(403);
      expect(res.send).toBeCalledWith('Invalid API Key');
    });

    it('should call next middleware when api key is valid', async () => {
      const apiKey = 'valid-api-key';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mockApiService.validateApiKey.mockResolvedValue(true);

      const req = {
        headers: {
          'x-api-key': apiKey,
        },
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn();

      await middleware.use(req, res, next);

      expect(mockApiService.validateApiKey).toBeCalledWith(apiKey);
      expect(next).toBeCalled();
    });
  });
});

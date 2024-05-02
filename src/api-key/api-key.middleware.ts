import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiKeyService } from './api-key.service';

/**
 * Middleware to check for a valid API key in the request headers.
 * If the x-api-key header matches a valid API key, calls the next middleware function.
 * Otherwise, sends a 403 Forbidden response with a JSON payload containing an error property.
 */
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  /**
   * Creates a new instance of ApiKeyMiddleware with the provided list of valid API keys.
   *
   * @param apiKeyService - Service that handles validation of API keys against a list of valid keys.
   */
  constructor(private readonly apiKeyService: ApiKeyService) {}

  /**
   * Middleware function to check if the x-api-key header in the request matches
   * one of the valid API keys provided when creating an instance of ApiKeyMiddleware.
   *
   * @param req - The request object.
   * @param res - The response object.
   * @param next - The next middleware function to call if the API key is valid.
   */
  async use(req: Request, res: Response, next: () => void) {
    // get API KEY
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      // there is no API KEY in headers -> 403: Forbidden
      return res.status(403).send('API Key required');
    }

    // there is API KEY in headers -> check if it is valid
    const isValid = await this.apiKeyService.validateApiKey(apiKey as string);
    if (!isValid) {
      // API KEY is not valid -> 403: Forbidden
      return res.status(403).send('Invalid API Key');
    }

    next(); // Calls the next middleware function if `apiKey` is valid.
  }
}

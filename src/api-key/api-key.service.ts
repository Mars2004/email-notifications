import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * A class that handles validation of API keys against a list of valid keys.
 */
@Injectable()
export class ApiKeyService {
  /**
   * An array of valid API keys that are accepted by the ApiKeyService.
   */
  private readonly validKeys: string[] = [];

  /**
   * Constructs a new ApiKeyService with the provided list of valid keys.
   * @param validKeys - An array of valid API keys.
   */
  constructor(private readonly configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.validKeys.push(this.configService.get<string>('API_KEY')!);
  }

  /**
   * Validates an API key against the list of valid keys.
   * @param apiKey - The API key to validate.
   * @returns A Promise that resolves to a boolean indicating whether the API key is valid.
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    return this.validKeys.includes(apiKey);
  }
}

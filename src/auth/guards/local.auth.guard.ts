import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * AuthGuard for local authentication strategy.
 *
 * This guard extends the AuthGuard class from @nestjs/passport package
 * and is specifically tailored for local authentication using a email
 * and password. It expects the credentials to be passed in the request body
 * (typically as `email` and `password` fields) and validates them using
 * the configured local strategy.
 *
 * @publicApi
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

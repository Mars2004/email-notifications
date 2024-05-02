import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthDto, validateAuthDto } from '../dto/auth.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const authDto = new AuthDto();
    authDto.email = email;
    authDto.password = password;
    await validateAuthDto(authDto);

    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Incorrect email or password');
    }
    return user;
  }
}

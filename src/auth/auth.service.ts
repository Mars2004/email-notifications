import { Injectable } from '@nestjs/common';
import { AuthDto, validateAuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signUp(authDto: AuthDto): Promise<UserEntity> {
    await validateAuthDto(authDto);
    const { email, password } = authDto;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.usersService.createUser(email, hashedPassword);

    return user;
  }

  async signIn(authDto: AuthDto): Promise<UserEntity | null> {
    await validateAuthDto(authDto);
    const { email, password } = authDto;
    return this.validateUser(email, password);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.usersService.getUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }
}

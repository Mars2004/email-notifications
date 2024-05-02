import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: UserEntity, done: (err: Error, user: any) => void): any {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    done(null, {
      id: user.id,
    });
  }

  async deserializeUser(
    user: any,
    done: (err: Error, payload: any) => void,
  ): Promise<any> {
    try {
      const foundUser = await this.usersService.getUserById(user.id);

      if (!foundUser) {
        done(new Error('User not found'), null);
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      done(null, foundUser);
    } catch (err) {
      done(err, null);
    }
  }
}

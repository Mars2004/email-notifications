import { AuthDto } from 'src/auth/dto/auth.dto';
import { v4 as uuid } from 'uuid';

export function GetTestUserAuthDto(random = false, isAdmin = false): AuthDto {
  const usernamePrefix = isAdmin ? 'e2e_admin' : 'e2e_user';
  const username = random ? `${usernamePrefix}_${uuid()}` : usernamePrefix;
  const userEmail = `${username}@test.com`;
  const password = '1I3.o8SL@a8B#i&';

  return { email: userEmail, password };
}

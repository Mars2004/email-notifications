import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsStrongPassword,
  validateOrReject,
} from 'class-validator';

@ApiTags('auth')
export class AuthDto {
  @ApiProperty({
    title: 'The user email address',
    description: 'Must be a valid email address',
    format: 'email',
    required: true,
    nullable: false,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    title: 'The user password',
    description:
      'Strong password (requiring at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character)',
    format: 'password',
    required: true,
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}

export async function validateAuthDto(authDto: AuthDto): Promise<void> {
  await validateOrReject(authDto);
}

import {
  Controller,
  Post,
  Body,
  HttpCode,
  ConflictException,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth.response.dto';
import { AuthDto } from './dto/auth.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local.auth.guard';
import { Request } from 'express';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signup')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a new user.',
    description: 'Register a new user to the system.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Wrong input data.' })
  @ApiResponse({ status: 403, description: 'Missing API key header.' })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async signUp(@Body() authDto: AuthDto): Promise<AuthResponseDto> {
    try {
      await this.authService.signUp(authDto);
      return { message: 'User registered successfully.' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }

  // TODO: add api rate limiter
  // TODO: add failed login attempts check
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login a user.',
    description: 'Login a user to the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Wrong input data.' })
  @ApiResponse({ status: 401, description: 'Incorrect email or password.' })
  @ApiResponse({ status: 403, description: 'Missing API key header.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async signIn(@Body() authDto: AuthDto, @Req() req: Request) {
    // User has been authenticated by LocalAuthGuard
    // Log in user to session
    const result = await new Promise((resolve, reject) => {
      if (!req.user) {
        throw new UnauthorizedException('Incorrect email or password');
      }

      req.logIn(req.user, (err) => {
        if (err) {
          reject(err);
        }
        resolve({
          message: 'Logged in successfully',
        });
      });
    });

    return result;
  }

  // TODO: set it for whole application and make just few of them public
  @Post('signout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Logout a user.',
    description: 'Logout a user from the system.',
  })
  @ApiSecurity('api_key')
  @ApiSecurity('session')
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Missing API key header.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async signout(@Req() req: Request): Promise<AuthResponseDto> {
    const result = await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        }
        resolve({ message: 'Logged out successfully' });
      });
    });

    return result as AuthResponseDto;
  }
}

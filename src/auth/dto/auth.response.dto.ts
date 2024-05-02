import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';

@ApiTags('auth')
export class AuthResponseDto {
  @ApiProperty({
    title: 'Response message',
    description: 'Contains response message',
  })
  @IsString()
  message: string;
}

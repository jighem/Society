import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'superadmin@example.com', description: 'User login email identity' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123', description: 'User security password credentials' })
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters in length' })
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'New security password selection' })
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters in length' })
  newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Secure rotation Refresh Token string' })
  @IsNotEmpty()
  refreshToken: string;
}

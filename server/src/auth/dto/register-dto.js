import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  name;

  @IsEmail()
  email;

  @IsString()
  @MinLength(8)
  password;

  @IsOptional()
  @IsString()
  mobile;
}

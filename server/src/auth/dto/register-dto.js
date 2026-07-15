import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/enums';

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

  @IsOptional()
  @IsEnum(Role)
  role;
}

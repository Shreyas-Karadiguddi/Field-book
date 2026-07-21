import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/enums';

export class CreateUserDto {
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

  @IsEnum(Role)
  role;

  @IsOptional()
  @IsString()
  area;
}

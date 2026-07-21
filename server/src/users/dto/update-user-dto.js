import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../../common/enums';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name;

  @IsOptional()
  @IsString()
  mobile;

  @IsOptional()
  @IsEnum(Role)
  role;

  @IsOptional()
  @IsString()
  area;
}

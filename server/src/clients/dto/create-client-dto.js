import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DealStage, SoftwareRelationship } from '../../common/enums';

export class CreateClientDto {
  @IsString()
  shopName;

  @IsString()
  contactPerson;

  @IsString()
  mobile;

  @IsOptional()
  @IsString()
  gstNumber;

  @IsOptional()
  @IsString()
  businessType;

  @IsOptional()
  @IsEnum(SoftwareRelationship)
  softwareRelationship;

  @IsOptional()
  @IsArray()
  competitorStack;

  @IsOptional()
  @IsEnum(DealStage)
  dealStage;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quotationAmount;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  lat;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  lng;

  @IsOptional()
  @IsString()
  address;

  @IsOptional()
  @IsString()
  area;

  @IsOptional()
  @IsString()
  city;

  @IsOptional()
  @IsString()
  state;
}

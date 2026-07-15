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

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  shopName;

  @IsOptional()
  @IsString()
  contactPerson;

  @IsOptional()
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
  @IsNumber()
  quotationAmount;

  @IsOptional()
  @IsLatitude()
  lat;

  @IsOptional()
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
  assignedExecutiveId;
}

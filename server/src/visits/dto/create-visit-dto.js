import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DealStage } from '../../common/enums';

export class CreateVisitDto {
  @IsString()
  clientId;

  @IsOptional()
  @IsString()
  conversationNotes;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  gpsLat;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  gpsLng;

  @IsOptional()
  @IsEnum(DealStage)
  dealStage;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quotationAmount;

  @IsOptional()
  @IsArray()
  productsDiscussed;

  @IsOptional()
  @IsDateString()
  followUpDate;

  @IsOptional()
  @IsString()
  followUpNotes;
}

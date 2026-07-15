import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VisitsController } from './visits-controller';
import { VisitsService } from './visits-service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService],
})
export class VisitsModule {}

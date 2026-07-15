import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma-module';
import { AuthModule } from './auth/auth-module';
import { ClientsModule } from './clients/clients-module';
import { VisitsModule } from './visits/visits-module';
import { ReportsModule } from './reports/reports-module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClientsModule,
    VisitsModule,
    ReportsModule,
  ],
})
export class AppModule {}

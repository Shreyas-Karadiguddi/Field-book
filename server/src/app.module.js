import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma-module';
import { AuthModule } from './auth/auth-module';
import { UsersModule } from './users/users-module';
import { ClientsModule } from './clients/clients-module';
import { VisitsModule } from './visits/visits-module';
import { ReportsModule } from './reports/reports-module';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    VisitsModule,
    ReportsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..','client', 'dist'),
      exclude: ['/api*'],
    }),
  ],
})
export class AppModule {}

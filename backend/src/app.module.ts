import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DataService } from './data.service';
import { PrescriptionsController } from './prescriptions.controller';

@Module({
  imports: [],
  controllers: [AppController, AuthController, PrescriptionsController],
  providers: [AppService, AuthService, DataService],
})
export class AppModule {}

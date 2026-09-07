import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthService } from './auth.service';
import { Database } from './database';
import { EventBus } from './event-bus';

@Module({ controllers: [AppController], providers: [Database, EventBus, AuthService] })
export class AppModule {}

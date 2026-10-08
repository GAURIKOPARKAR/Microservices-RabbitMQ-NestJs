import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RabbitmqService } from './rabbitmq/rabbitmq.service.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RabbitmqService],
})
export class AppModule {}

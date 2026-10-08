import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { RabbitmqService } from './rabbitmq/rabbitmq.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('send')
  sendMessage(): string {
  this.rabbitmqService.sendMessage('Order created');
  return 'Message sent to RabbitMQ';
}
}

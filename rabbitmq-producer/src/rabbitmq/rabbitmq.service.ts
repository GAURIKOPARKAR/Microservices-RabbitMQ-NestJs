import { Injectable, OnModuleInit } from '@nestjs/common';
import amqp, { Channel, ChannelModel } from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private connection: ChannelModel;
  private channel: Channel;

  async onModuleInit() {
    this.connection = await amqp.connect('amqp://localhost:5672');
  
    this.channel = await this.connection.createChannel();
  
    await this.channel.assertQueue('orders');
  
    console.log('Connected to RabbitMQ');
  }
  sendMessage(message: string) {
    this.channel.sendToQueue(
      'orders',
      Buffer.from(message),
    );
  }
}
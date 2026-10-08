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

    console.log('Consumer connected to RabbitMQ');

    this.channel.consume('orders', (message) => {
      if (message) {
        console.log('Received:', message.content.toString());

        // this.channel.ack(message);
      }
    });
  }
}
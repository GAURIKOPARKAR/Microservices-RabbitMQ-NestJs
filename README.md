# Microservices with RabbitMQ & NestJS

A hands-on implementation of **microservice-to-microservice communication using RabbitMQ and NestJS**.

This project demonstrates how a producer service sends messages to a RabbitMQ queue and how an independent consumer service receives, processes, and acknowledges those messages.

The project intentionally uses **`amqplib`**, the Node.js AMQP client library, to demonstrate the underlying RabbitMQ concepts before moving to higher-level NestJS microservice abstractions.

---

## 🏗️ Project Architecture

```text
                         ┌──────────────────────┐
                         │   RabbitMQ Broker     │
                         │                      │
                         │    orders queue      │
                         └──────────▲───────────┘
                                    │
                         consume()  │
                                    │
                  ┌─────────────────┴────────────────┐
                  │                                  │
        ┌─────────┴──────────┐             ┌─────────┴──────────┐
        │  Producer Service  │             │  Consumer Service  │
        │                    │             │                    │
        │    NestJS          │             │    NestJS          │
        │    Port 3000       │             │                    │
        └─────────┬──────────┘             └────────────────────┘
                  │
                  │ sendToQueue()
                  ▼
             RabbitMQ
             orders queue
```

### Message Flow

```text
HTTP Request
     │
     ▼
Producer Service
     │
     │ sendToQueue()
     ▼
RabbitMQ
     │
     │ consume()
     ▼
Consumer Service
     │
     │ process message
     ▼
ack()
```

---

# 📁 Project Structure

```text
Microservices-RabbitMQ-NestJs/
│
├── rabbitmq-producer/
│   ├── src/
│   │   ├── rabbitmq/
│   │   │   └── rabbitmq.service.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── package.json
│   └── ...
│
├── rabbitmq-consumer/
│   ├── src/
│   │   ├── rabbitmq/
│   │   │   └── rabbitmq.service.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# 🚀 Technologies Used

- **Node.js**
- **NestJS**
- **TypeScript**
- **RabbitMQ**
- **AMQP**
- **amqplib**
- **Docker**

---

# 🐇 What is RabbitMQ?

RabbitMQ is a **message broker** that enables applications and services to communicate through messages.

Instead of one service directly calling another service, a producer can place a message into a RabbitMQ queue.

A consumer can then receive and process that message.

For example:

```text
Order Service
     │
     │ "Order created"
     ▼
RabbitMQ
     │
     ▼
Notification Service
```

This allows services to communicate asynchronously and reduces direct dependency between them.

---

# 📦 What is `amqplib`?

`amqplib` is a Node.js library that allows Node.js applications to communicate with RabbitMQ using the **AMQP (Advanced Message Queuing Protocol)**.

It provides APIs for:

- Connecting to RabbitMQ
- Creating channels
- Creating queues
- Publishing messages
- Consuming messages
- Acknowledging messages
- Handling message delivery

In this project, `amqplib` is used directly so that the underlying RabbitMQ concepts are clearly visible.

---

# ⚙️ Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Docker
- Git

Verify the installations:

```bash
node --version
npm --version
docker --version
```

---

# 🐇 Step 1 — Start RabbitMQ

RabbitMQ is run using Docker.

Execute:

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4-management
```

### What does this command do?

```text
-d
```

Runs the container in detached/background mode.

```text
--name rabbitmq
```

Names the Docker container `rabbitmq`.

```text
-p 5672:5672
```

Exposes RabbitMQ's AMQP port.

```text
-p 15672:15672
```

Exposes the RabbitMQ Management UI.

```text
rabbitmq:4-management
```

Uses the RabbitMQ image with the management plugin enabled.

---

# 🔍 Step 2 — Verify RabbitMQ

Run:

```bash
docker ps
```

You should see the RabbitMQ container running.

You can also open the RabbitMQ Management UI:

```text
http://localhost:15672
```

Default credentials:

```text
Username: guest
Password: guest
```

The management UI allows you to inspect:

- Queues
- Messages
- Connections
- Channels
- Message rates
- Ready messages
- Unacknowledged messages

---

# 📤 Step 3 — Set Up the Producer

Open a terminal in:

```text
rabbitmq-producer
```

Install dependencies:

```bash
npm install
```

Start the producer:

```bash
npm run start:dev
```

The producer connects to RabbitMQ and creates/verifies the `orders` queue.

You should see something similar to:

```text
Connected to RabbitMQ
Nest application successfully started
```

---

# 📥 Step 4 — Set Up the Consumer

Open another terminal in:

```text
rabbitmq-consumer
```

Install dependencies:

```bash
npm install
```

Start the consumer:

```bash
npm run start:dev
```

You should see:

```text
Consumer connected to RabbitMQ
```

The consumer then starts listening to the `orders` queue.

---

# 📨 Step 5 — Send a Message

The producer exposes an HTTP endpoint:

```text
GET http://localhost:3000/send
```

Open the URL in a browser or use an API client.

The producer executes:

```typescript
this.rabbitmqService.sendMessage('Order created');
```

Internally, the producer sends the message to the `orders` queue:

```typescript
this.channel.sendToQueue(
  'orders',
  Buffer.from(message),
);
```

---

# 🔄 Step 6 — Message Reaches the Consumer

The consumer listens to the same queue:

```typescript
this.channel.consume('orders', (message) => {
  if (message) {
    console.log(
      'Received:',
      message.content.toString(),
    );

    this.channel.ack(message);
  }
});
```

The message flow is:

```text
GET /send
    │
    ▼
Producer
    │
    │ "Order created"
    ▼
orders queue
    │
    ▼
Consumer
    │
    ▼
Received: Order created
    │
    ▼
ack()
```

The consumer terminal will display:

```text
Received: Order created
```

---

# ✅ Message Acknowledgement

RabbitMQ supports message acknowledgements.

The consumer uses:

```typescript
this.channel.ack(message);
```

`ack()` means:

> "The consumer successfully received and processed this message."

Once RabbitMQ receives the acknowledgement, the message can be removed from the queue.

---

# 🔎 Understanding Ready vs Unacked

RabbitMQ's Management UI provides useful message states.

### Ready

A message is **Ready** when it is waiting in the queue and has not yet been delivered to a consumer.

```text
Producer
   │
   ▼
RabbitMQ
   │
   └── Ready
```

### Unacked

A message becomes **Unacked** after RabbitMQ delivers it to a consumer but the consumer has not acknowledged it yet.

```text
RabbitMQ
   │
   │ deliver
   ▼
Consumer
   │
   └── Unacked
```

After:

```typescript
channel.ack(message);
```

the message is acknowledged and removed.

---

# 💥 What Happens When a Consumer Crashes?

One of the important RabbitMQ reliability features demonstrated in this project is message redelivery.

Suppose the consumer receives a message:

```text
RabbitMQ
    │
    ▼
Consumer
    │
    │ message delivered
    ▼
Unacked
```

But the consumer crashes before calling:

```typescript
channel.ack(message);
```

RabbitMQ detects that the consumer/channel has disappeared.

The unacknowledged message can then be **requeued** and become Ready again.

```text
Unacked
   │
   │ Consumer crashes
   ▼
Ready
   │
   │ Consumer reconnects
   ▼
Delivered again
```

This helps prevent messages from being silently lost when a consumer fails.

---

# 🧠 Why Acknowledgements Matter

Consider an order-processing service:

```text
Receive Order
     │
     ▼
Save Order to Database
     │
     ▼
Send Notification
     │
     ▼
ack()
```

If the application crashes before `ack()`:

```text
Receive Order
     │
     ▼
Save Order ✅
     │
     ▼
Application crashes 💥
     │
     X
   ack()
```

RabbitMQ may redeliver the message.

Therefore, production consumers should consider **idempotent processing** so that processing the same message more than once does not create incorrect side effects.

---

# 🔌 RabbitMQ Connection

Both applications connect to RabbitMQ using:

```typescript
amqp.connect('amqp://localhost:5672');
```

The connection is then used to create a channel:

```typescript
this.connection = await amqp.connect(
  'amqp://localhost:5672',
);

this.channel = await this.connection.createChannel();
```

### Connection vs Channel

A useful distinction is:

```text
Application
     │
     │ TCP connection
     ▼
RabbitMQ
     │
     ├── Channel 1
     ├── Channel 2
     └── Channel 3
```

A connection represents the network connection to RabbitMQ.

A channel is a lightweight communication path used over that connection.

---

# 📋 Queue Declaration

Both services use:

```typescript
await this.channel.assertQueue('orders');
```

`assertQueue()` ensures that the `orders` queue exists.

If the queue already exists, RabbitMQ uses the existing queue.

This allows both producer and consumer to safely declare the queue they depend on.

---

# 📤 Producer: Sending Messages

The producer uses:

```typescript
this.channel.sendToQueue(
  'orders',
  Buffer.from(message),
);
```

The message is converted to a Node.js `Buffer` because AMQP messages are transmitted as binary data.

For example:

```text
"Order created"
       │
       ▼
Buffer
       │
       ▼
RabbitMQ
```

---

# 📥 Consumer: Receiving Messages

The consumer uses:

```typescript
this.channel.consume(
  'orders',
  (message) => {
    if (message) {
      console.log(
        'Received:',
        message.content.toString(),
      );

      this.channel.ack(message);
    }
  },
);
```

`consume()` registers a long-running consumer.

Instead of repeatedly asking RabbitMQ:

```text
"Do you have a message?"
"Do you have a message?"
"Do you have a message?"
```

the consumer tells RabbitMQ:

> "Deliver messages from this queue to me whenever they are available."

---

# 🏛️ Why This is a Microservices Example

The producer and consumer are separate NestJS applications.

```text
rabbitmq-producer
       │
       │
       ▼
   RabbitMQ
       │
       │
       ▼
rabbitmq-consumer
```

They do not directly call each other's APIs.

They communicate through the message broker.

This allows them to be developed, deployed, scaled, and restarted independently.

For example, in a real application:

```text
Order Service
     │
     ▼
RabbitMQ
     │
     ├──────────────► Notification Service
     │
     ├──────────────► Inventory Service
     │
     └──────────────► Analytics Service
```

This is one of the common patterns used in event-driven and asynchronous systems.

---

# 🧪 Hands-On Experiment

You can experiment with the acknowledgement behavior.

### 1. Start RabbitMQ

```bash
docker start rabbitmq
```

### 2. Start the producer

```bash
cd rabbitmq-producer
npm install
npm run start:dev
```

### 3. Start the consumer

In another terminal:

```bash
cd rabbitmq-consumer
npm install
npm run start:dev
```

### 4. Send a message

Open:

```text
http://localhost:3000/send
```

### 5. Check RabbitMQ

Open:

```text
http://localhost:15672
```

Navigate to:

```text
Queues → orders
```

Observe:

```text
Ready
Unacked
Total
```

### 6. Experiment with `ack()`

Temporarily remove:

```typescript
this.channel.ack(message);
```

Send a message and observe the **Unacked** count.

Then stop the consumer.

The unacknowledged messages can return to **Ready** because RabbitMQ did not receive successful acknowledgements.

Restore `ack()` afterward.

---

# 🎯 Key Concepts Demonstrated

This project covers the following RabbitMQ concepts:

- Message broker
- Producer
- Consumer
- Queue
- AMQP
- `amqplib`
- Connection
- Channel
- `assertQueue()`
- `sendToQueue()`
- `consume()`
- Message Buffer
- Message acknowledgement
- `ack()`
- Ready messages
- Unacknowledged messages
- Message redelivery
- Asynchronous communication
- Basic microservice communication

---

# 🔮 Possible Next Steps

This project can be extended with more advanced RabbitMQ patterns:

- Exchanges
- Routing keys
- Direct exchange
- Fanout exchange
- Topic exchange
- Multiple consumers
- Consumer load balancing
- `prefetch()`
- `nack()`
- Message rejection
- Retry mechanisms
- Dead Letter Exchanges (DLX)
- Dead Letter Queues (DLQ)
- Durable queues
- Persistent messages
- Idempotent consumers
- NestJS `Transport.RMQ`
- `@MessagePattern()`
- Docker Compose
- Multiple microservices

---

# 📚 Learning Goal

The purpose of this project is not only to make RabbitMQ work, but to understand the communication flow underneath a NestJS microservice architecture:

```text
Producer
   │
   │ publish/send message
   ▼
RabbitMQ Broker
   │
   │ queue
   ▼
Consumer
   │
   │ process
   ▼
acknowledgement
```

Understanding these fundamentals makes it easier to work with higher-level frameworks and abstractions such as the **NestJS Microservices RabbitMQ transport**.

---

## 👩‍💻 Author

**Gauri Koparkar**

Backend-focused Software Developer  
Node.js | NestJS | MongoDB | React | Microservices

---
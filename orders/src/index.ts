import mongoose from 'mongoose';
import { DatabaseConnectionError } from '@tunedev_tickets/common';
import { natsWrapper } from './nats-wrapper';
import {
  TicketCreatedListener,
  TicketUpdatedListener,
  ExpirationCompleteListener,
} from './events';
import { app } from './app';

const start = async () => {
  try {
    if (!process.env.JWT_KEY) {
      throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI must be defined in the env');
    }
    if (
      !process.env.NATS_CLIENT_ID ||
      !process.env.NATS_CLUSTER_ID ||
      !process.env.NATS_URL
    ) {
      throw new Error(
        'one or all of these env variable is/are missing (NATS_URL, NATS_CLUSTER_ID, NATS_CLIENT_ID) '
      );
    }
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', () => {
      console.log('Shuting down nats gracefully');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketUpdatedListener(natsWrapper.client).listen();
    new TicketCreatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log('Mongo is connected 😅');
  } catch (err) {
    console.log(err);
    throw new DatabaseConnectionError();
  }
};

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Am i going to show 😄');
  console.log(`Tickets service Listening on port: ${port}`);
});

start();

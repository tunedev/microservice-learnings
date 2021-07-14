import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events';

const start = async () => {
  try {
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

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.log(err);
  }
};

start();

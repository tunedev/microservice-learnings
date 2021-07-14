import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

import { TicketCreatedlistener } from './events';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('Nats is closing gracefully 🤞🏾');
    process.exit(0);
  });

  new TicketCreatedlistener(stan).listen();
});
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());

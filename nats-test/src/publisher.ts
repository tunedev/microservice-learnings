import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events';

const stan = nats.connect('ticketing', 'abc', { url: 'http://localhost:4222' });

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  try {
    await new TicketCreatedPublisher(stan).publish({
      id: '123abc',
      title: 'test nats/typescript',
      price: 70,
    });
  } catch (error) {
    console.error(error);
  }
  // const data = JSON.stringify({
  //   id: '12122332',
  //   title: 'nats test ticket',
  //   price: 30,
  // });

  // stan.publish('ticket:created', data, () => {
  //   console.log('Event published');
  // });
});

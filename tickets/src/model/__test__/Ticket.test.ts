import { Ticket } from '../Ticket';

it('implements optimistic concurrency control', async () => {
  // Create an instance of  a ticket
  const ticket = Ticket.build({
    title: 'A ticket',
    price: '20',
    userId: '123',
  });
  // Save the ticket to the database
  await ticket.save();

  // fetch the ticket twice
  const ticket1 = await Ticket.findById(ticket.id);
  const ticket2 = await Ticket.findById(ticket.id);

  // make two seperate changes to the tickets fetched
  ticket1!.set({ price: '25' });
  ticket2!.set({ price: '30' });

  // save the first fetched ticket
  await ticket1!.save();

  // save the second fetched ticket and expect an error
  // expect(async () => await ticket2!.save()).toThrow();
  try {
    await ticket2!.save();
  } catch (err) {
    return;
  }

  throw new Error('Expected save to fail');
});

it('increment version number', async () => {
  const ticket = Ticket.build({
    title: 'A ticket',
    price: '20',
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toBe(0);
  await ticket.save();
  expect(ticket.version).toBe(1);
  await ticket.save();
  expect(ticket.version).toBe(2);
});

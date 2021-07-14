import { Ticket } from '../ticket';

it('should implement optimistic concurrency control', async () => {
  const ticket = Ticket.build({
    title: 'test ticket',
    price: 20,
  });
  await ticket.save();

  const ticket1 = await Ticket.findById(ticket.id);
  const ticket2 = await Ticket.findById(ticket.id);

  await ticket1!.set({ title: 'test ticket 1' }).save();

  try {
    await ticket2!.set({ title: 'test ticket 2' }).save();
  } catch (e) {
    return;
  }

  throw new Error('Expect ticket2.save to return an error');
});

it('should increment version on save', async () => {
  const ticket = Ticket.build({
    title: 'test ticket',
    price: 20,
  });
  await ticket.save();

  expect(ticket.version).toBe(0);

  await ticket.save();
  expect(ticket.version).toBe(1);

  await ticket.save();
  expect(ticket.version).toBe(2);
});

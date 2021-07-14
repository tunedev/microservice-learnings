import { Order, OrderStatus } from '../order';

it('should implement optimistic concurrency control', async () => {
  const seedTicket = await global.seedTicket();
  const order = Order.build({
    userId: 'user-id',
    status: OrderStatus.Created,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    ticket: seedTicket,
  });
  await order.save();

  const order1 = await Order.findById(order.id);
  const order2 = await Order.findById(order.id);

  await order1!.set({ title: 'test Order 1' }).save();

  try {
    await order2!.set({ title: 'test order 2' }).save();
  } catch (e) {
    return;
  }

  throw new Error('Expect order2.save to return an error');
});

it('should increment version on save', async () => {
  const seedTicket = await global.seedTicket();
  const order = Order.build({
    userId: 'user-id',
    status: OrderStatus.Created,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    ticket: seedTicket,
  });
  await order.save();

  expect(order.version).toBe(0);

  await order.save();
  expect(order.version).toBe(1);

  await order.save();
  expect(order.version).toBe(2);
});

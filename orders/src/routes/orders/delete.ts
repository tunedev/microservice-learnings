import { Router, Request, Response } from 'express';
import { validateOrder } from '../../middleware';
import { authRequired } from '@tunedev_tickets/common';
import { OrderStatus } from '../../models';
import { natsWrapper } from '../../nats-wrapper';
import { OrderCancelledPublisher } from '../../events';

const router = Router();

router.delete(
  '/api/orders/:orderId',
  authRequired,
  validateOrder,
  async (req: Request, res: Response) => {
    const { order } = req;

    if (!order) {
      return;
    }

    order.status = OrderStatus.Cancelled;
    await order.save();
    order.populate('ticket');

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      userId: order.userId,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).json({ data: order });
  }
);

export { router as deleteRouter };

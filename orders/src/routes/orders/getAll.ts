import { Router, Request, Response } from 'express';
import { Order } from '../../models';
import { authRequired } from '@tunedev_tickets/common';

const router = Router();

router.get('/api/orders', authRequired, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.currentUser!.id }).populate(
    'ticket'
  );
  res.status(200).json({ data: orders });
});

export { router as getAllRouter };

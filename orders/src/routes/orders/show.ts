import { Router, Request, Response } from 'express';
import { authRequired } from '@tunedev_tickets/common';
import { validateOrder } from '../../middleware';

const router = Router();

router.get(
  '/api/orders/:orderId',
  authRequired,
  validateOrder,
  async (req: Request, res: Response) => {
    const { order } = req;

    res.status(200).json({ data: order });
  }
);

export { router as showRouter };

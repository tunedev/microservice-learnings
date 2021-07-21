import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  authRequired,
  requestValidation,
  NotFoundError,
  UnauthorizedError,
  UnprocessableRequest,
} from '@tunedev_tickets/common';
import { stripe } from '../../stripe';
import { natsWrapper } from '../../nats-wrapper';
import { PaymentCreatedPublisher } from '../../events';

import { Order, Payment } from '../../model';

const router = Router();

router.post(
  '/api/payments',
  authRequired,
  [body('token').trim().notEmpty(), body('orderId').trim().notEmpty()],
  requestValidation,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (!order.isOwner(req.currentUser!.id)) {
      throw new UnauthorizedError();
    }

    if (!order.validForPayment()) {
      throw new UnprocessableRequest(
        `Order with id: ${orderId} is no longer valid for payment`
      );
    }

    const chargesData = {
      amount: order.price * 100,
      source: token,
      currency: 'usd',
      description: `Payment for Order with id: ${order.id}`,
    };

    const chargeResponse = await stripe.charges.create(chargesData);

    const payment = Payment.build({
      orderId,
      stripeId: chargeResponse.id,
    });
    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).json({ status: 'success' });
  }
);

export { router as createChargeRouter };

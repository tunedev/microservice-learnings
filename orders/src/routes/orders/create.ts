import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  authRequired,
  NotFoundError,
  requestValidation,
  OrderStatus,
  UnprocessableRequest,
} from '@tunedev_tickets/common';
import { natsWrapper } from '../../nats-wrapper';
import { OrderCreatedPublisher } from '../../events';
import { body } from 'express-validator';
import { Ticket, Order } from '../../models';

const EXPIRATION_WINDOW_SECONDS =
  process.env!.EXPIRATION_WINDOW_SECONDS &&
  !isNaN(parseInt(process.env!.EXPIRATION_WINDOW_SECONDS))
    ? parseInt(process.env!.EXPIRATION_WINDOW_SECONDS)
    : 15 * 60;

const router = Router();

router.post(
  '/api/orders',
  authRequired,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('A valid ticket id must be provided'),
  ],
  requestValidation,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // Ensure ticket is available for order
    const ticket = await Ticket.findById(ticketId);
    if (!ticket)
      throw new NotFoundError(`Ticket with Id: ${ticketId} not found`);

    // Confirm ticket has not been reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new UnprocessableRequest('Ticket is already been reserved');
    }

    // Calculate an expiration time for the order
    const expiration = new Date();
    console.log({
      EXPIRATION_WINDOW_SECONDS,
      fromEnv: process.env.EXPIRATION_WINDOW_SECONDS,
    });
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // save orrder and save to db
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    // publish an event that order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      userId: order.userId,
      status: order.status,
      version: order.version,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    });

    res.status(201).json({ data: order });
  }
);

export { router as createRouter };

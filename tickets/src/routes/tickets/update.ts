import { Router, Request, Response } from 'express';
import { Ticket } from '../../model';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../../events';
import { natsWrapper } from '../../nats-wrapper';
import {
  NotFoundError,
  authRequired,
  requestValidation,
  UnauthorizedError,
  UnprocessableRequest,
} from '@tunedev_tickets/common';

const router = Router();

router.patch(
  '/api/tickets/:ticketId',
  authRequired,
  [
    body('title')
      .not()
      .isEmpty()
      .optional()
      .withMessage('Title cannot be empty'),
    body('price')
      .isFloat({ gt: 0 })
      .optional()
      .withMessage('Price cannot be less than Zero'),
  ],
  requestValidation,
  async (req: Request, res: Response) => {
    const { ticketId } = req.params;
    const { title, price } = req.body;

    const ticketToBeUpdated = await Ticket.findById(ticketId);

    if (!ticketToBeUpdated) {
      throw new NotFoundError(
        `Ticket with ticketId: ${ticketId} does not exist`
      );
    }

    if (ticketToBeUpdated.orderId) {
      throw new UnprocessableRequest(
        'Cannot update an already reserved ticket'
      );
    }

    if (req.currentUser?.id !== ticketToBeUpdated.userId) {
      throw new UnauthorizedError();
    }

    ticketToBeUpdated.price = price || ticketToBeUpdated.price;
    ticketToBeUpdated.title = title || ticketToBeUpdated.title;

    await ticketToBeUpdated.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticketToBeUpdated.id,
      title: ticketToBeUpdated.title,
      price: parseFloat(ticketToBeUpdated.price),
      userId: ticketToBeUpdated.userId,
      version: ticketToBeUpdated.version,
    });
    res.status(200).json({
      message: `ticket with id: ${ticketId} was updated successfully`,
      data: ticketToBeUpdated,
    });
  }
);

export { router as updateTicketRouter };

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { authRequired, requestValidation } from '@tunedev_tickets/common';
import { Ticket } from '../../model';
import { TicketCreatedPublisher } from '../../events';
import { natsWrapper } from '../../nats-wrapper';
const router = Router();

router.post(
  '/api/tickets',
  authRequired,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('price must be greater than Zero'),
  ],
  requestValidation,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await ticket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: parseFloat(ticket.price),
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(201).json({ message: 'setup nicely', data: ticket });
  }
);

export { router as createTicketRouter };

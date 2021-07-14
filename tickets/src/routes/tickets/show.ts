import { Router, Request, Response } from 'express';
import { Ticket } from '../../model';
import { NotFoundError } from '@tunedev_tickets/common';

const router = Router();

router.get('/api/tickets/:ticketId', async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new NotFoundError(`Ticket with Id: ${ticketId} does not exist`);
  }

  res.status(200).json({ data: ticket });
});

export { router as showTicketRouter };

import { Router, Response, Request } from 'express';
import { Ticket } from '../../model';

const router = Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({});

  res.status(200).json({ data: tickets });
});

export { router as getAllTicketsRouter };

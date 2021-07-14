import { Application } from 'express';
import { currentUser } from '@tunedev_tickets/common';

// Module imports
import {
  createTicketRouter,
  showTicketRouter,
  getAllTicketsRouter,
  updateTicketRouter,
} from './tickets';

export default (app: Application) => {
  app.use(currentUser);
  app.use(createTicketRouter);
  app.use(showTicketRouter);
  app.use(getAllTicketsRouter);
  app.use(updateTicketRouter);
};

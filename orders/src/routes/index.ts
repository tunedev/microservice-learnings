import { Application } from 'express';
import { currentUser } from '@tunedev_tickets/common';

// Module imports
import { getAllRouter, showRouter, deleteRouter, createRouter } from './orders';

export default (app: Application) => {
  app.use(currentUser);
  app.use(getAllRouter);
  app.use(showRouter);
  app.use(deleteRouter);
  app.use(createRouter);
};

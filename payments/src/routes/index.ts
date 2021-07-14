import { Application } from 'express';
import { currentUser } from '@tunedev_tickets/common';
import { createChargeRouter } from './payments';

export default (app: Application) => {
  app.use(currentUser);
  app.use(createChargeRouter);
};

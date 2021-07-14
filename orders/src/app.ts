// external modules
import express, { json, urlencoded } from 'express';
import 'express-async-errors';
import logger from 'morgan';
import { NotFoundError, errorHandler } from '@tunedev_tickets/common';
import cookieSession from 'cookie-session';

// internal modules
import router from './routes';

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(logger('dev'));
app.use(urlencoded({ extended: true }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

// Initialize routes
router(app);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

import mongoose from 'mongoose';
import { DatabaseConnectionError } from '@tunedev_tickets/common';

import { app } from './app';

const start = async () => {
  try {
    if (!process.env.JWT_KEY) {
      throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI must be defined in the env');
    }
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log('Mongo is connected 😅');
  } catch (err) {
    console.log(err);
    throw new DatabaseConnectionError();
  }
};

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Auth service Listening on port: ${port}`);
});

start();

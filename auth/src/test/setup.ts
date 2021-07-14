import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { UserAttrs } from '../models';
import { app } from '../app';

declare global {
  namespace NodeJS {
    interface Global {
      signup(user: UserAttrs): Promise<string[]>;
    }
  }
}

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'canyoukeepasecret';
  mongo = new MongoMemoryServer();
  const mongoURI = await mongo.getUri();

  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signup = async (user) => {
  const response = await request(app)
    .post('/api/users/signup')
    .send(user)
    .expect(201);

  return response.get('Set-Cookie');
};

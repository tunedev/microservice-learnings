import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      getCookie(userId?: string): string[];
      generateRandomId(): string;
    }
  }
}

jest.mock('../nats-wrapper');

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
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
global.generateRandomId = () => new mongoose.Types.ObjectId().toHexString();

global.getCookie = (userId = new mongoose.Types.ObjectId().toHexString()) => {
  // Build a JWT payload
  const payload = { id: userId, email: 'test@mail.com' };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object
  // Turn that session into JSON
  const sessionJSON = JSON.stringify({ jwt: token });

  // Take JSON and encode it as base64
  const sessionBase64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  return [`express:sess=${sessionBase64}`];
};

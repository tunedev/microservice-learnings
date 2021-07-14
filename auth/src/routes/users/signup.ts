// external modules
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import {
  requestValidation,
  UnprocessableRequest,
} from '@tunedev_tickets/common';

// internal modules
import { User } from '../../models';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must have character length between 4 and 20'),
  ],
  requestValidation,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new UnprocessableRequest('Email is already in use');
    }

    const newUser = User.build({ email, password });
    await newUser.save();

    // Generate JWT
    const userToken = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_KEY!
    );

    // Store it on the request session
    req.session = { jwt: userToken };

    res.status(201).json({
      message: 'Welcome to ticketing, nice to have you',
      data: newUser,
    });
  }
);

export { router as signup };

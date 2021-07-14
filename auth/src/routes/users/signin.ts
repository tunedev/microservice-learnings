// external modules
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import {
  UnprocessableRequest,
  requestValidation,
} from '@tunedev_tickets/common';

// internal modeles
import { User } from '../../models';
import { Password } from '../../services';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ],
  requestValidation,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new UnprocessableRequest('Invalid Credentials');
    }

    const validPassword = await Password.compare(
      existingUser.password,
      password
    );

    if (!validPassword) {
      throw new UnprocessableRequest('Invalid Credentials');
    }

    // Generate JWT
    const userToken = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY!
    );

    // Store it on the request session
    req.session = { jwt: userToken };

    res.status(200).json({
      message: 'Welcome back to ticketing',
      data: existingUser,
    });
  }
);

export { router as signin };

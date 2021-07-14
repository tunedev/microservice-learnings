import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Order, OrderDoc } from '../models';
import {
  NotFoundError,
  UnauthorizedError,
  UnprocessableRequest,
} from '@tunedev_tickets/common';

declare global {
  namespace Express {
    interface Request {
      order?: OrderDoc;
    }
  }
}

export const validateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new UnprocessableRequest('Order id must be a valid object id');
  }

  const order = await Order.findById(orderId).populate('ticket');

  if (!order) {
    throw new NotFoundError(`Order with id: ${orderId} Not found`);
  }

  if (order.userId !== req.currentUser!.id) {
    throw new UnauthorizedError();
  }

  req.order = order;
  next();
};

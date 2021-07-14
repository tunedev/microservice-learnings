import mongoose from 'mongoose';
import { OrderStatus } from '@tunedev_tickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };

interface OrderAttr {
  id: string;
  price: number;
  version: number;
  userId: string;
  status: OrderStatus;
}

export interface OrderDoc extends mongoose.Document {
  id: string;
  price: number;
  version: number;
  userId: string;
  status: OrderStatus;
  validForPayment(): boolean;
  isOwner(userId: string): boolean;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attr: OrderAttr): OrderDoc;
  findByIdAndPrevVersion(event: {
    id: string;
    version: number;
  }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    status: { type: String, required: true, enum: Object.values(OrderStatus) },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attr: OrderAttr) => {
  return new Order({
    _id: attr.id,
    price: attr.price,
    version: attr.version,
    userId: attr.userId,
    status: attr.status,
  });
};

orderSchema.methods.validForPayment = function () {
  return this.get('status') != OrderStatus.Cancelled;
};

orderSchema.methods.isOwner = function (userId: string) {
  return this.get('userId') === userId;
};

orderSchema.statics.findByIdAndPrevVersion = function (event: {
  id: string;
  version: number;
}) {
  return this.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };

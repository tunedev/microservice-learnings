import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export interface TicketAttr {
  title: string;
  price: string;
  userId: string;
}

export interface TicketDocs extends mongoose.Document {
  title: string;
  price: string;
  userId: string;
  version: number;
  orderId?: string;
}

export interface TicketModel extends mongoose.Model<TicketDocs> {
  build(attr: TicketAttr): TicketDocs;
}

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: String, retuired: true },
    userId: { type: String, required: true },
    orderId: { type: String, required: false },
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
// switch the default __v mongoose field key to version
ticketSchema.set('versionKey', 'version');

// add plugin updateIfCurrentPlugin to ticketSchema
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attr: TicketAttr) => {
  return new Ticket(attr);
};

export const Ticket = mongoose.model<TicketDocs, TicketModel>(
  'tickets',
  ticketSchema
);

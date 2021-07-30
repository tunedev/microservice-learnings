import { useRequest } from '../../hooks';
import Router from 'next/router';

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'Post',
    body: { ticketId: ticket.data.id },
    onSuccess: (order) => {
      console.log(order);
      Router.push('/orders/[orderId]', `/orders/${order.data.id}`);
    },
  });
  return (
    <div>
      <h1>{ticket.data.title}</h1>
      <h4>{ticket.data.price}</h4>
      {errors}
      <button className='btn btn-primary' onClick={() => doRequest()}>
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (ctx, axios) => {
  const { ticketId } = ctx.query;
  const ticket = (await axios.get(`/api/tickets/${ticketId}`)).data;
  return { ticket };
};

export default TicketShow;

import { useState, useEffect } from 'react';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';
import { useRequest } from '../../hooks';

const OrderShow = ({ order, currentUser }) => {
  const [validInSecs, setValidInSecs] = useState(0);
  const { doRequest, errors } = useRequest({
    url: `/api/payments`,
    method: 'POST',
    body: { orderId: order.data.id },
    onSuccess: ({ data }) => {
      console.log({ paymentResponse: data });
      Router.push('/orders');
    },
  });

  useEffect(() => {
    const calValidInSecs = () => {
      const secsRemaining = Math.round(
        (new Date(order.data.expiresAt) - new Date()) / 1000
      );
      setValidInSecs(secsRemaining);
    };
    calValidInSecs();
    const timerId = setInterval(calValidInSecs, 1000);

    return () => {
      clearInterval(timerId);
    };
  });

  if (validInSecs < 0) {
    return (
      <div>
        <h1>Order expired</h1>
      </div>
    );
  }
  return (
    <div>
      <h1>Purchase for {order.data.ticket.title}</h1>
      <p>
        You have <span>{validInSecs}</span> seconds left to order
      </p>
      {errors}
      <StripeCheckout
        token={({ id }) => {
          console.log(id);
          doRequest({ token: id });
        }}
        stripeKey='pk_test_51JCGIOEffuZjktik9hRLH4GryVN4hZn6x8bHIYfZlcwxlQlM6jpQs8ZgTc0bL9igh23rWrOm7pT4H1ygPrnXeRyz00stZL5EOA'
        amount={order.data.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderShow.getInitialProps = async (ctx, axios) => {
  const order = (await axios.get(`/api/orders/${ctx.query.orderId}`)).data;
  return { order };
};
export default OrderShow;

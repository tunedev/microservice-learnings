const OrderList = ({ orders }) => {
  return (
    <div>
      <h1>Order History</h1>
      <ul>
        {orders.data.map((order) => (
          <li style={{ listStyle: 'none' }} key={order.id}>
            <hr />
            <b>Title:</b> {order.ticket.title}
            <br />
            <b>Price:</b> {order.ticket.price}
            <br />
            <b>Status:</b> {order.status}
            <br />
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

OrderList.getInitialProps = async (ctx, axios) => {
  const orders = (await axios.get('/api/orders')).data;
  return { orders };
};

export default OrderList;

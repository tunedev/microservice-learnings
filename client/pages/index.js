import Link from 'next/link';

const Landing = ({ currentUser, tickets }) => {
  console.log({ currentUser, tickets });
  const ticketList = tickets.data.map((ticket) => (
    <tr key={ticket.id}>
      <td>{ticket.title}</td>
      <td>{ticket.price}</td>
      <td>
        <Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
          <a className='nav-link'>View</a>
        </Link>
      </td>
    </tr>
  ));
  return (
    <div>
      <h1>Tickets</h1>
      <table className='table'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

Landing.getInitialProps = async (context, axios) => {
  const tickets = (await axios.get('/api/tickets')).data;
  return {
    tickets,
  };
};

export default Landing;

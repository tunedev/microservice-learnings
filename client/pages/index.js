import createAxios from '../api/build-client';

const Landing = ({ currentUser }) => {
  console.log({ currentUser });
  return currentUser ? (
    <div>
      <h1>Welcome user </h1>
      <p className='my=0'>your email is: {currentUser.email}</p>
    </div>
  ) : (
    <h1>You are not signed in</h1>
  );
};

Landing.getInitialProps = async (context) => {
  console.log('LANDING PAGE Intitial Props');
  const axios = createAxios(context);
  const { data } = await axios.get('/api/users/currentuser');
  console.log('LANDING PAGE Intitial Props', { data });
  return data;
};

export default Landing;

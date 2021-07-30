import 'bootstrap/dist/css/bootstrap.css';
import createAxios from '../api/build-client';

import { Header } from '../components';

const customApp = ({ Component, pageProps, currentUser }) => (
  <div>
    <Header currentUser={currentUser} />
    <div className='container'>
      <Component currentUser={currentUser} {...pageProps} />
    </div>
  </div>
);

customApp.getInitialProps = async (appContext) => {
  const axios = createAxios(appContext.ctx);
  const { data } = await axios.get('/api/users/currentuser');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      axios,
      data.currentUser
    );
  }

  return {
    pageProps,
    ...data,
  };
};

export default customApp;

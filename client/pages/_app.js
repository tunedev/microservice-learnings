import 'bootstrap/dist/css/bootstrap.css';
import createAxios from '../api/build-client';

import { Header } from '../components';

const customApp = ({ Component, pageProps, currentUser }) => (
  <div>
    <Header currentUser={currentUser} />
    <Component {...pageProps} />
  </div>
);

customApp.getInitialProps = async (appContext) => {
  const axios = createAxios(appContext.ctx);
  const { data } = await axios.get('/api/users/currentuser');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }

  return {
    pageProps,
    ...data,
  };
};

export default customApp;

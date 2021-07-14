import Router from 'next/router';

import { useEffect } from 'react';
import { useRequest } from '../../hooks';

const SignOut = () => {
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: 'get',
    data: {},
    onSuccess: () => Router.push('/'),
  });

  useEffect(() => doRequest(), []);

  return <div>Signing you out...</div>;
};

export default SignOut;

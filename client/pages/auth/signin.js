import { useState } from 'react';
import { useRequest } from '../../hooks';
import Router from 'next/router';

const Signin = () => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/users/signin',
    method: 'post',
    body: { email, password },
    onSuccess: () => Router.push('/'),
  });
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const response = await doRequest();
        console.log({ response });
      }}
    >
      <h1>Sign in</h1>
      <div className='form-group'>
        <label htmlFor='email'>Email Address</label>
        <input
          type='email'
          name='email'
          id='email'
          className='form-control'
          onChange={({ target }) => setEmail(target.value)}
          value={email}
        />
      </div>
      <div className='form-group'>
        <label htmlFor='password'>Password</label>
        <input
          type='password'
          name='password'
          id='password'
          className='form-control'
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      {errors}
      <button className='btn btn-primary'>Sign In</button>
    </form>
  );
};

export default Signin;

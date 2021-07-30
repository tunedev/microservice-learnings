import { useState } from 'react';
import Router from 'next/router';
import { useRequest } from '../../hooks';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'POST',
    body: { title, price },
    onSuccess: () => Router.push('/'),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log({ title, price });
    await doRequest();
    setPrice('');
    setTitle('');
  };

  const handleBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) return;

    setPrice(value.toFixed(2));
  };

  return (
    <div>
      <h1>Create New Ticket</h1>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='title'>Title</label>
          <input
            name='title'
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            className='form-control'
            required
            type='text'
          />
        </div>
        <div className='form-group'>
          <label htmlFor='price'>Price</label>
          <input
            name='price'
            value={price}
            onBlur={handleBlur}
            onChange={({ target }) => setPrice(target.value)}
            className='form-control'
            required
            type='number'
          />
        </div>
        {errors}
        <button className='btn btn-primary'>Submit</button>
      </form>
    </div>
  );
};

export default NewTicket;

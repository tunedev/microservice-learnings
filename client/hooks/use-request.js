import axios from 'axios';
import { useState } from 'react';

export const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null);
      const response = await axios[method](url, body);

      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (err) {
      console.log({ useRequestError: err });
      setErrors(
        <div className='alert alert-danger'>
          <h4>Ooops:</h4>
          <ul className='my=0'>
            {err.response.data.errors.map((error) => (
              <li key={error.field}>
                <span>{error.message}</span>{' '}
              </li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};

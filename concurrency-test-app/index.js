const axios = require('axios');

const cookie =
  'express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJall3WkdWbFpqWXdPR1prTnpSbU1EQXhPV1l5WVRZeU5pSXNJbVZ0WVdsc0lqb2ljMkZ1ZFhOcExtRXVZbUZpWVhSMWJtUmxRR2R0WVdsc0xtTnZiU0lzSW1saGRDSTZNVFl5TlRJeU16WXhNSDAuejdkYzdXcncwVEJmQkVZN3ltU3Z3Yng5bHRNSzlsV2hlR0xLakE2dXUyTSJ9';

const doRequst = async (number) => {
  const { data } = (
    await axios.post(
      `https://ticketing.dev/api/tickets`,
      {
        title: 'concurrency test ticket',
        price: '20',
      },
      {
        headers: {
          cookie,
        },
      }
    )
  ).data;

  await axios.patch(
    `https://ticketing.dev/api/tickets/${data.id}`,
    {
      price: '25',
    },
    {
      headers: {
        cookie,
      },
    }
  );

  await axios.patch(
    `https://ticketing.dev/api/tickets/${data.id}`,
    {
      price: '15',
    },
    {
      headers: {
        cookie,
      },
    }
  );

  console.log(`Request Number: ${number} complete`);
};

(async () => {
  for (let loop = 0; loop < 400; loop++) {
    await doRequst(loop);
  }
})();

export const stripe = {
  charges: {
    create: jest.fn().mockReturnValue({ id: 'paymentTestID' }),
  },
};

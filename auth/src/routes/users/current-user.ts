import express from 'express';
import { currentUser } from '@tunedev_tickets/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  res.status(200).json({ currentUser: req.currentUser || null });
});

export { router as currentuser };

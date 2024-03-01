import express from 'express';
import UserRouter from './UserRouter.js';
import ConversationRouter from './ConversationRouter.js';
import MessageRouter from './MessageRouter.js';
const router = express.Router();

router.use('/user', UserRouter);
router.use('/conversation', ConversationRouter);
router.use('/message', MessageRouter);

export default router;

import express from 'express';

import {FetchConversation, sendMessage} from '../controllers/MessageController.js';
import { JwtVerify } from '../middlewares/Authentication.js'

const router = express.Router();

router.get('/:id', JwtVerify, FetchConversation);
router.post('/:id', JwtVerify, sendMessage);

export default router;


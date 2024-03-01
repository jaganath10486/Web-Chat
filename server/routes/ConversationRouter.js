import express from 'express';

import {createConversation, FetchAllConversations, createGroup, RenameGroupName, addToGroup, RemoveFromGroup} from '../controllers/ConversationController.js';
import {JwtVerify} from '../middlewares/Authentication.js';

const router = express.Router();

router.get('/start-conversation/:id', JwtVerify, createConversation);

router.get('/fetch-all-conversations', JwtVerify, FetchAllConversations);

router.post('/create-group', JwtVerify, createGroup);
router.patch('/add-to-group/:id', JwtVerify, addToGroup);
router.patch('/remove-from-group/:id', JwtVerify, RemoveFromGroup);
router.patch('/rename-group/:id', JwtVerify, RenameGroupName);
// router.get('/rename-group/65dc112004d1fc27204b3109', (req, res) => {
//     console.log(req.body);
// })

//Group Chat


export default router;
import express from 'express';

import {UserModel} from '../models/userSchema.js';
import { RegisterUser,LoginUser,UserInfo, updateUserInfo, getUserById, searchUser, googleAuth } from '../controllers/UserController.js'
import {JwtVerify} from '../middlewares/Authentication.js';

const router = express.Router();

router.post('/signup', RegisterUser);
router.post('/login', LoginUser);
router.post('/google-login', googleAuth);
router.get('/info', JwtVerify, UserInfo);
router.put('/info', JwtVerify, updateUserInfo);
router.get('/user-by-id/:id', getUserById);
router.get('/search-user', JwtVerify, searchUser)

export default router;
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config();

import {DBConnection} from './config/dbConnect.js';
import router from './routes/index.js';

DBConnection();

const app =express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1',router);

export {app};

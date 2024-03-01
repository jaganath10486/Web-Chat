import mongoose from "mongoose";

import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGODB_URL;
export const DBConnection = async() => {
    try
    {
        const connection = await mongoose.connect(url)
        console.log("Mongo DB connection established")
    }
    catch(err)
    {
        console.log(err);
    }
}
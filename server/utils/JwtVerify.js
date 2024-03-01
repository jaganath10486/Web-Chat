import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userSchema.js';

export const veirfyJWT = async(token) => {
    try
    {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(!decoded)
        {
            throw new Error('Not Valid Token');
        }
        const user = await UserModel.findById(decoded.id);
        if(!user)
        {
            throw new Error('Not Found');
        }
        return user;
    }
    catch(err)
    {
        throw err;
    }
}
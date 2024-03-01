
import {veirfyJWT} from '../utils/JwtVerify.js';

export const JwtVerify = async(req, res, next)=>{
    if(req.headers.authorization)
    {
        const token = req.headers.authorization.split(' ')[1];
        try
        {
            const user = await veirfyJWT(token);
            req.user = user;
            next();
        }
        catch(err)
        {
          return res.status(401).json({"message" : err.message});
        }
    }
    else
    {
        return res.status(400).json({"message": "Token is required"})
    }
}
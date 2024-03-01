import jwt from 'jsonwebtoken';

export function generateJWT(id)
{
    return jwt.sign({id}, process.env.JWT_SECRET_KEY, {
        expiresIn : '24h'
    });
}

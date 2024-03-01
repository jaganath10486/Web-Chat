import { UserModel } from "../models/userSchema.js";
import bcrypt from 'bcryptjs';

import { generateJWT } from '../utils/generateJWT.js'
import { OAuth2Client } from "google-auth-library"


const client = new OAuth2Client(
    process.env.GOOGLE_AUTH_CLIENT_ID,
    process.env.GOOGLE_AUTH_SECRET_KEY,
    'postmessage'
)

export const RegisterUser = async (req, res) => {
    const body = req.body;
    console.log(body);
    try {
        if (!body.email || !body.password || !body.gender || !body.phoneNo) {
            console.log("Bad Request");
            return res.status(400).json({ "message ": "Bad Request" });
        }

        const existingUser = await UserModel.countDocuments({ email: body.email })
        if (existingUser > 0) {
            return res.status(400).json({ "message": "User already exists with email id" });
        }

        const newUser = await UserModel.create({
            ...body
        });

        if (newUser) {
            console.log("User Saved Successfully");
            console.log(newUser);
            return res.status(201).json({ "message": "User Saved Successfully" });
        }
        else {
            return res.status(500).json({ message: "Failed to create" });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            "message": err.message
        })
    }
}

export const LoginUser = async (req, res) => {
    try {
        const body = req.body;
        if (!body.email || !body.password) {
            return res.status(400).json({ "message": "Bad Request" });
        }
        const existingUser = await UserModel.findOne({ email: body.email });
        if (!existingUser) {
            return res.status(401).json({ "message": "User Does Not Exist" });
        }
        console.log(existingUser);
        const validPassword = await bcrypt.compare(req.body.password, existingUser.password);
        if (validPassword) {
            return res.status(200).json({
                "message": "Successfully Login",
                "data": {
                    "email": existingUser.email,
                    "token": generateJWT(existingUser._id)
                }
            })
        }
        else {
            return res.status(401).json({ "message": "Invalid Password!!!" });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ "message": err.message });
    }
}

export const googleAuth = async (req, res) => {
    try {
        const { code } = req.body;

        const tokens = await client.getToken(code)
        const tokenId = tokens.tokens.id_token;
        
        const verify = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.CLIENT_ID,
        });

        console.log(verify.payload);

        const { email_verified, email, name, picture } = verify.payload;

        if (!email_verified) res.json({ message: 'Email Not Verified' });

        const userExist = await UserModel.findOne({ email }).select('-password');

        if (userExist) {

            res.status(200).json({
                "message": "Successfull Login", "data": {
                    "token": generateJWT(userExist._id),
                    "email": userExist.email
                }
            });

        } else {
            const password = email;
            const createUser = await UserModel.create({
                email,
                password,
                name,
                profilePic: picture,
                gender : 'Male'
            })
            if (createUser) {
                return res
                    .status(200)
                    .json({
                        message: 'User registered Successfully', data: {
                            "token": generateJWT(createUser._id),
                            "email": createUser.email
                        }
                    });
            }
            else {
                return res.status(500).json({ "message": "Falied to Regester Account Try after some time" });
            }

        }
    } catch (error) {
        res.status(500).json({ error: error });
        console.log('error in googleAuth backend' + error);
    }
};


export const UserInfo = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id);
        return res.status(200).json({ "message": "retrived user Info", data: user });
    }
    catch (err) {
        return res.status(500).json({ "message": err.message });
    }
}

export const updateUserInfo = async (req, res) => {
    try {
        const allowedFields = ['bio', 'name', 'username', 'password'];
        const body = req.body;
        let update = {}
        for (let key in body) {
            if (allowedFields.includes(key)) {
                update[key] = body[key];
            }
            else {
                return res.status(400).json({ "message": `Bad Request!! Cannot update ${key}` })
            }
        }
        const updateRecords = await UserModel.findByIdAndUpdate(req.user._id, { $set: update });
        if (updateRecords) {
            return res.status(200).json({ "message": "Updated Data Successfully" });
        }
        else {
            return res.status(500).json({ "message": "Failed to update" });
        }
    }
    catch (err) {
        return res.status(500).json({ "message": err.message });
    }
}


export const getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ "message": "Bad Request" });
        }
        const user = await UserModel.findById(id);
        if (!user) {
            return res.json({ "message": "User Not Found" });
        }
        return res.status(200).json({ "data ": user });
    }
    catch (err) {
        return res.status(500).json({ "message": err.message });
    }
}

export const searchUser = async (req, res) => {
    try {
        const text = req.query.search;
        if (!text) {
            return res.status(200).json({ data: [] });
        }
        let query = {};
        if (text) {
            query = {
                $or: [
                    { name: { $regex: text, $options: 'i' } },
                    { email: { $regex: text, $options: 'i' } },
                ],
            }
        }
        const users = await UserModel.find(query).find({ _id: { $ne: req.user._id } });
        // console.log(text);
        return res.status(200).json({ data: users });
    }
    catch (err) {
        return res.status(500).json({ "message": err.message });
    }
}
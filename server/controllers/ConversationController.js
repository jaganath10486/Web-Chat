import { ConversationModel } from "../models/ConversationSchema.js";
import { UserModel } from "../models/userSchema.js";

export const createConversation = async(req, res) => {
    const  userId = req.params.id;  
    console.log(userId);
    if(!userId)
    {
        return res.status(400).json({message : "Need User ID for starting conversation"});
    }
    let conversationExists = await ConversationModel.find({
        isGroup : false,
        $and : [
            {users : {$elemMatch : {$eq : userId}}},
            {users : {$elemMatch : {$eq : req.user._id}}}    
        ],
    })
    .populate('users', '-password')
    .populate('lastMessage');

    conversationExists = await UserModel.populate(conversationExists, 
        {
            path : 'lastMessage.senderId',
            select : 'username',
        })

    if(conversationExists.length > 0)
    {
        return res.status(200).json({"message" : "Conversation already exists", data : conversationExists[0]});
    }

    let chat = {
        isGroup : false,
        users : [userId, req.user._id],
    }
    try{
        let newChat = await ConversationModel.create(chat);
        if(!newChat)
        {
            return res.status(500).json({"message" : "Failed to Craete the Conversation"})
        }
        newChat = await ConversationModel.findById(newChat._id).populate('users', '-password');
        return res.status(201).json({"message" : "Conversation Created Successfully", data : newChat})
    }
    catch(err)
    {
        return res.status(500).json({"message" : err.message})
    }
}


export const FetchAllConversations = async(req, res) =>{
    try
    {
        let id = req.user._id;
        console.log("ID : ", id);
        let conversations = await ConversationModel.find({
            users : {$elemMatch : {$eq : id}}
        }).populate('users', '-password')
        .populate('lastMessage')
        .sort({ updatedAt : -1});
        if(conversations.length == 0)
        {
            return res.status(200).json({data : [], "message" :"Start a Conersation"});
        }

        conversations = await UserModel.populate(conversations, {
            path : 'lastMessage.senderId',
            select : 'username'
        });
        console.log(conversations);
        
        return res.status(200).json({data : conversations, "message" :"Retrived conversations"});
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({"message" : err.message});
    }
}


export const createGroup = async(req, res) =>{
    try
    {
        const {name, members} = req.body;
        if(!members && ! name)
        {
            return res.status(400).json({message:"Bad Request"});
        }
        if(members.length <= 0)
        {
            return res.status(400).json({message:"Group Should contain more than one person"});
        }
        let group = {
            isGroup : true,
            chatName : name,
            users : [...members, req.user._id],
            groupAdmin : req.user._id
        }
        if(req.body.groupPic)
        {
            group[groupPic] = req.body.groupPic;
        }
        const newGroup = await ConversationModel.create(group);
        if(!newGroup)
        {
            return res.status(500).json({message:"Failed to create group"});
        }
        const createdGroup = await ConversationModel.findById(newGroup._id)
        .populate('users', '-password -email ')
        .populate('groupAdmin', '-password -email');

        return res.status(201).json({data : createdGroup});
    }
    catch(err)
    {
        return res.status(500).json({message: err.message})
    }

}

export const RenameGroupName = async(req, res) => {
    try
    {
        let id = req.params.id;
        let text = req.body.name;
        if(!id && !text)
        {
            return res.status(400).json({message:"Bad Request"});
        }
        const group = await ConversationModel.findOne({
            _id : id,
            isGroup : true
        })
        if(!group)
        {
            return res.json({"Message" : "No Group Found"});
        }
        // if(group.groupAdmin != req.user._id)
        // {
        //     return res.status(401).json({message:"You are not allowed to change the group name"});
        // }
        console.log(text);
        const updatedGroup = await ConversationModel.findByIdAndUpdate(id, {
            $set : {chatName : text}
        }).populate('users', '-password -email')
        .populate('groupAdmin', '-password');
        if(updatedGroup)
        {
            return res.status(201).json({message:"Group Name Updated", data : updatedGroup});
        }
        return res.status(200).json({message:"Failed to update the Group Name"})
    }
    catch(err)
    {
        return res.status(500).json({message : err.message});
    }
}

export const addToGroup = async(req, res)=>{
    try
    {
        let id = req.params.id;
        let user = req.body.user;
        if(!id && !user)
        {
            return res.status(400).json({message:"Bad Request"});
        }
        const group = await ConversationModel.findOne({
            _id : id,
            isGroup : true
        })
        if(!group)
        {
            return res.json({"Message" : "No Group Found"});
        }
        // if(group.groupAdmin != req.user._id)
        // {
        //     return res.status(401).json({message:"You are not allowed to add group members"});
        // }
        if(group.users.includes(user))
        {
           return res.status(400).json({"message" : "Already Group Members Exist"}); 
        }
        const updatedGroup = await ConversationModel.findByIdAndUpdate(id, {
            $push : {users : user }
        }).populate('users', '-password -email')
        .populate('groupAdmin', '-password');
        if(updatedGroup)
        {
            return res.status(201).json({message:"User Added Successfully", data : updatedGroup});
        }
        return res.status(200).json({message:"Failed to add the Group Member"})
    }
    catch(err)
    {
        return res.status(500).json({message : err.message});
    }
}



export const RemoveFromGroup = async(req, res)=>{
    try
    {
        let id = req.params.id;
        let user = req.body.user;
        if(!id && !user)
        {
            return res.status(400).json({message:"Bad Request"});
        }
        const group = await ConversationModel.findOne({
            _id : id,
            isGroup : true
        })
        if(!group)
        {
            return res.json({"Message" : "No Group Found"});
        }
        // if(group.groupAdmin != req.user._id)
        // {
        //     return res.status(401).json({message:"You are not allowed to remov group members"});
        // }
        if(!group.users.includes(user))
        {
           return res.status(400).json({"message" : "No Group Members Exist in the Group"}); 
        }

        let updatedGroup = await ConversationModel.findByIdAndUpdate(id, {
            $pull : {users : user}
        }).populate('users', '-password -email')
        .populate('groupAdmin', '-password');
        if(updatedGroup)
        {
            return res.status(201).json({message:"User Removed Successfully", data : updatedGroup});
        }
        return res.status(200).json({message:"Failed to remove the Group Member"})
    }
    catch(err)
    {
        return res.status(500).json({message : err.message});
    }
}
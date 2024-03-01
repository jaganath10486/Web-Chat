import {MessageModel} from '../models/MessageSchema.js';
import {ConversationModel} from '../models/ConversationSchema.js';
import {UserModel} from '../models/userSchema.js';

export const FetchConversation = async(req, res) =>{
    try
    {
        let id = req.params.id;
        console.log(id);
        if(!id)
        {
            return res.status(400).json({message:"Bad request"});
        }

        const messages = await MessageModel.find({
            conversationId : id
        })
        .populate('senderId', '-password -email');
        console.log(messages);

        if(messages.length > 0)
        {
            return res.status(200).json({"message" : "Fetched Successfully", data : messages});
        }
        return res.status(200).json({"message" : "Fetched Successfully", data : messages });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({message:err.message});
    }
}

export const sendMessage = async(req, res) =>{
    try
    {
        let id = req.params.id;
        const message = req.body.message
        if(!id || !message)
        {
            return res.status(404).json({message : "Bad Request"});
        }
        const conversation = await ConversationModel.findById(id);
        if(!conversation)
        {
            return res.status(400).json({message : "No Conversation Found with this id"});  
        }   
        let Message = await MessageModel.create({
            senderId : req.user._id,
            message,
            conversationId : id
        });

        if(Message)
        {
            await ConversationModel.findByIdAndUpdate(conversation._id, 
                {
                    $set : {lastMessage : Message}
                });

            Message = await Message.populate({
                path : 'senderId',
                select : 'username email',
                model : 'Users'
            })

            return res.json({data : Message})  
        }
        else
        {
            return res.status(500).json({message : "Unable to send the Message try after some Time"});
        }
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({message : err.message});
    }
}
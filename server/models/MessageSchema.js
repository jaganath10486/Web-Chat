import mongoose, {Schema} from "mongoose";

const MessageSchema = new Schema({
    conversationId : {
        type : Schema.Types.ObjectId,
        ref : 'Conversations'
    },
    senderId : {
        type : Schema.Types.ObjectId,
        ref : 'Users',
    },
    type : {
        type : String,
        default : 'text'
    },
    message : {
        type : String,
        trim : true
    },
    sentAt : {
        type : Date,
        default : Date.now
    },
    attachments : {
        type : String
    }
},
{
    timestamps : true
})

export const MessageModel = mongoose.model('Messages', MessageSchema);
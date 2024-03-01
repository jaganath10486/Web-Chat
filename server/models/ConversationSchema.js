import mongoose, { trusted } from "mongoose";
import { Schema } from "mongoose"

const ConversationSchema = new Schema({
    isGroup : {
        type : Boolean,
        default : false,
    },
    groupAdmin : {
        type : Schema.Types.ObjectId,
        ref : 'Users',
        requied : false,
    },
    groupPic : {
        type : String,
        default : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ22jz5dtZ1GS6ymnI2v-N2igC6dTKBu9HfC1m6qphO2Q&s',
    },
    chatName : {
        type : String,
    },

    users : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Users',
        }
    ],
    lastMessage : {
        type : Schema.Types.ObjectId,
        ref : 'Messages'
    },
},
{
    timestamps : true
})

const ConversationModel = mongoose.model('Conversations', ConversationSchema);
export { ConversationModel};
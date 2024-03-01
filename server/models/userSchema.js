import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from 'bcryptjs'

const UserSchema = new Schema({
    email : {
        type : String,
        required: true,
        lowercase : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    name : {
        type : String,
    },
    profilePic : {
        type : String,
        default : function(){
            if(this.gender == 'Male')
            {
                return 'https://pbs.twimg.com/media/EgaRMKwU0AEqVID.jpg';
            }
            else if(this.gender == 'Female')
            {
                return 'https://www.shutterstock.com/image-vector/mother-woman-profile-mascot-vector-260nw-1943696398.jpg'
            }
        }
    },
    gender : {
        type : String,
        enum : ['Male', 'Female'],
        required : true
    },
    bio : {
        type : String,
        default : 'Call Me',
    },
    username : {
        type : String,
        default : function()
        {
            return this.name;
        }
    },
    phoneNo : {
        type : String,
        
    }
},
    {
        timestamps : true
    }
)

UserSchema.index({email : 1});

UserSchema.pre('save', async function(next){
    if(this.isModified('password'))
    {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
})

export const UserModel = mongoose.model('Users', UserSchema);

const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");
const loans = require('./loans');

const userSchema=new Schema(
    {
        
        name:{
            type:String,
            required:true
        },
        email:
        {
            type:String,
            required:true,
            unique:true,
            lowercase: true

        },
        sonof:{
            type:String,
            required:true

        },
        address:{
            type:String,
            required:true
        },
        phone: { type: Number, unique: true, required: true },
        dateofbirth:{
            type:Date,
            required:true
        },
        person:{
            type:String,
            required:true
        },
        
        Transactions:[{
            type:Schema.Types.ObjectId,
            ref:'Transaction'
        }],
        Account:{
            type:Schema.Types.ObjectId,
            ref:'Account'
        },
        loans:[{
           type:Schema.Types.ObjectId,
           ref:'loans' 
    }],
        
        
    }
)

userSchema.plugin(passportLocalMongoose);
const User=mongoose.model('User', userSchema);
module.exports = User;
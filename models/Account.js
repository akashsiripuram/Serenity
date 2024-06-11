const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const  AccountsSchema=new Schema({
    AccountNumber:{
        type:String,
        required:true
    },
    AccountType:{
        type:String,
        required:true
    },
    DateCreated:{
        type:String
    },
    Balance:{
        type:Number,
        required:true
    },
    
   
    
    
})

module.exports=mongoose.model('Account',AccountsSchema);

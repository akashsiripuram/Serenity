const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const loanSchema=new Schema({
    loan_id:{
        type:String,
        required:true,
        unique:true
    },
    amount:{
        type:Number,
        required:true
    },
    // interest:{
    //     type:Number,
    //     required:true
    // },
    tenure:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        required:true,
        default:'pending'
    },
    date:{
        type:Date,
        default:Date.now()
        // required:true
    },
    isApproved:{
        type:Boolean,
        required:true,
        default:false
    },
    loantype:{
        type:String,
        required:true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }


})

module.exports=mongoose.model('loans',loanSchema);
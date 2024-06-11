const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Transaction schema
const TransactionSchema = new Schema({
    transaction_id: {
        type: String,
        required: true,
        unique: true
    },
    from_account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    to_account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    type: {
        type: String,
        
    },
    
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    
}, {
    timestamps: true
});

const Transactions = mongoose.model('Transaction', TransactionSchema);

module.exports = Transactions;

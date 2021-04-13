import mongoose from 'mongoose';

// database recreate dari blockchain
// on-chain hanya transaksi dan hash article
// off-chain schema trmsk login credential, data article dan flags

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: String,
    lastName: String,
    role: {
        type: String,
        default: "Reader"
    },
    publicKey: {
        type: String,
        default: "None"
    },
    rep: {
        type: Number,
        default: 0
    },
    joined: {
        type: Date,
        default: Date.now()
    }
});


export const User = mongoose.model('User', UserSchema);

import mongoose from 'mongoose';

const NotifSchema = mongoose.Schema({
    class: String,
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    data: {
        type: Object,
        default: {}
    },
    status: {
        type: String,
        default: "unread"
    },
    message: String,
    date: {
        type: Date,
        default: Date.now()
    }
})

export const Notif = mongoose.model('Notif', NotifSchema)
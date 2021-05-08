import {validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {Publisher} from '../models/publications.js';
import { User } from '../models/users.js';
import {Notif} from '../models/notifs.js';
import {} from './callContract.js';

export const inviteAuthor = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try {
        let sender = req.body.userID
        let toEmail = req.body.recipientEmail
        let senderUser = await User.findOne({'_id': sender})
        let toUser = await User.findOne({'email': toEmail})
        let to = toUser._id
        let publisher = await Publisher.findOne({'chiefOfficer': sender})
        let publisherID = publisher._id
        var notif = new Notif({
            class: "invite/author",
            from: sender,
            to: to,
            status: "unread",
            data: {
                publisher: publisherID,
                title: "Invitation to Authorship from " + publisher.name,
                message: "User @" + senderUser.username + 
                " has sent an invitation for you to join " + publisher.name +
                " as one of their authors! If this message is meant for you, please click 'Accept' " +
                "to join as an author"
            }
        })
        await notif.save()
        publisher.pendingAuthors.push(to)
        await publisher.save()
        console.log(notif)
        res.status(200).send({notif: notif})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

export const getUserNotifs = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try {
        let userID = req.body.userID
        let notifs = await Notif.find({'to': userID, 'status': 'unread'})
        console.log(notifs)
        res.status(200).send({notifs: notifs})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Fetching");
    }
}

export const changeStatus = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try{
        let notifID = req.body.notifID
        let status = req.body.status
        let notif = await Notif.findOneAndUpdate({'_id': notifID}, {'status': status})
        await notif.save()
        res.status(200).send({notif: notif})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Fetching");
    }
}
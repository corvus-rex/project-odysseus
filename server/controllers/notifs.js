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
                publisher: publisherID
            }
        })
        await notif.save()
        publisher.pendingAuthors.push(to)
        await publisher.save()
        res.status(200).send({notif: notif})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}
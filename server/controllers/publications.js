import {validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {Publisher} from '../models/publications.js';
import {registerUser, electAuthorship, revokeAuthorship} from './callContract.js';
import multer from 'multer';
import { User } from '../models/users.js';

const logoPath = '/uploads/logo'
const logoPathSave = '../uploads/logo'

export const registerPublisher = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try{
        const pubName = req.body.name;
        const chiefOfficer = req.body.chiefOfficer;
        const logo = req.body.logo;
        const logoStorage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, logoPathSave)
            },
            filename: function (req, file, cb) {
                cb(null, req.body.filename);
            }
        })
        const uploadImg = multer({storage: logoStorage}).fields([
            {name: 'logo', maxCount: 1}
        ]);
        let publisher = await Publisher.findOne({'name': pubName})
        if (publisher) {
            return res.status(400).json({msg: "Publisher with same name already exist"});
        };
        await User.findOneAndUpdate({
            '_id': chiefOfficer
        }, 
        {
            'hasPublisher': true,
            'role': 'Officer'
        })
        let user = await User.findOne({'_id': chiefOfficer})
        publisher = new Publisher({
            name: pubName,
            chiefOfficer: chiefOfficer,
            logo: logoPath + req.body.filename
        })
        await publisher.save();
        uploadImg(req, res, function(err) {
            if (err) {
                console.log(err)
                res.status(500).send("Error in Saving");
            }
        })
        console.log(user)
        res.status(200).send({user: user})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

export const getPublisher = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try {
        const userID = req.body.userID
        const role = req.body.userRole
        if (role == 'Officer') {
            let publisher = await Publisher.findOne({'chiefOfficer': userID})
            let chiefOfficer = await User.findOne({'_id': userID})
            res.status(200).send({publisher: publisher, chiefOfficer: chiefOfficer})
        }
        else if (role == 'Author') {
            let publisher = await Publisher.find({'authors': userID})
            let chiefOfficer = await User.findOne({'_id': publisher.chiefOfficer})
            res.status(200).send({publisher: publisher, chiefOfficer: chiefOfficer})
        }
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Fetching");
    }
}
export const findPublisherByID = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try {
        let pubID = req.body.pubID
        let publisher = await Publisher.findOne({'_id': pubID})
        res.status(200).send({publisher: publisher})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Fetching");
    }

}

export const acceptAuthorship = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
    };
    try {
        let userID = req.body.userID
        let publisherID = req.body.publisherID
        let newAuthor = req.body.publicKey
        let user = await User.findOneAndUpdate({'_id': userID}, {'role': "Author", 'hasPublisher': true})
        var publisherObj = null
        let publisher = await Publisher.findOne({'_id': publisherID}, function(err, obj) {
            publisherObj = obj
        })
        console.log(publisherObj)
        let chiefOfficer = await User.findOne({'_id': publisherObj.chiefOfficer})
        let pendingAuthors = publisherObj.pendingAuthors.filter(() => {
            return publisherObj.pendingAuthors != userID
        })
        publisherObj.authors.push(userID)
        console.log(publisherObj.authors)
        publisher = await Publisher.findOneAndUpdate({'_id': publisherID}, 
        {'authors': publisherObj.authors, 'pendingAuthors': pendingAuthors})
        await user.save()
        await publisher.save()
        user = await User.findOne({'_id': userID})
        publisher = await Publisher.findOne({'_id': publisherID})
        electAuthorship(chiefOfficer.publicKey, newAuthor)
        res.status(200).send({publisher: publisher, user: user})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Fetching");
    }
}

export const revokeAuthor = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
    };
    try {
        let authorID = req.body.authorID
        let publisherID = req.body.publisherID
        let authorKey = req.body.authorKey
        let authors = []
        let chiefOfficerID = null
        let publisher = await Publisher.findOne({'_id': publisherID}, 
        function(err, obj) {
            authors = obj.authors
            chiefOfficerID = obj.chiefOfficer
        })
        let filteredAuthors = authors.filter((author) => {
            return author != authorID
        })
        console.log(authorID)
        console.log(filteredAuthors)
        let updatedPublisher = await Publisher.findByIdAndUpdate({
            '_id': publisherID
        }, {
            'authors': filteredAuthors
        })
        let author = await User.findOneAndUpdate({
            '_id': authorID
        }, {
            'hasPublisher': false
        })
        await updatedPublisher.save()
        await author.save()
        let chiefOfficerKey = null
        let chiefOfficer = await User.findOne({
            '_id': chiefOfficerID
        }, function(err, obj) {
            chiefOfficerKey = obj.publicKey
        })
        revokeAuthorship(chiefOfficerKey, authorKey)
        res.status(200).send({publisher: updatedPublisher})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Fetching");
    }
}
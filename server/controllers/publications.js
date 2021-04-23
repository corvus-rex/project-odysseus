import {validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {Publisher} from '../models/publications.js';
import {registerUser} from './callContract.js';
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
            'hasPublisher': true
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
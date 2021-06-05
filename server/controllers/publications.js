import {validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {Publisher, Publication} from '../models/publications.js';
import {registerUser, electAuthorship, revokeAuthorship} from './callContract.js';
import multer from 'multer';
import { User } from '../models/users.js';

const logoPath = '/uploads/logo'
const logoPathSave = '../uploads/logo'
const evidencePath = '/uploads/flagEvidence'
const evidencePathSave = '../uploads/flagEvidence'

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
            let publisher = await Publisher.findOne({'authors': userID})
            console.log("Publisher: ", publisher)
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
        var publisherObj
        let publisher = await Publisher.findOne({'_id': publisherID}, function(err, obj) {
            publisherObj = obj
        })
        console.log(publisherObj)
        let chiefOfficer = await User.findOne({'_id': publisherObj.chiefOfficer})
        let pendingAuthors = publisherObj.pendingAuthors.filter((author) => {
            return author != userID
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
            'role': "Reader",
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

export const getPublishedList = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try {
        let publisherID = req.body.publisherID
        console.log(publisherID)
        let published = await Publication.find({
            'status': 'Published',
            'publisher': publisherID,
            'revised': false
        })
        res.status(200).send({published: published})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Fetching");
    }
}

export const newDraft = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try {
        let authorID = req.body.authorID
        let author = await User.findOne({'_id': authorID})
        let publisher = req.body.publisherID
        let title = req.body.title
        let description = req.body.description
        let topic = req.body.topic
        let locations = req.body.locations
        let tags = req.body.tags
        let content = req.body.content
        let publication = new Publication({
            authors: [author],
            publisher: publisher,
            title: title,
            description: description,
            topic: topic,
            locations: locations,
            tags: tags,
            article: content
        })
        console.log(content)
        console.log(publication)
        console.log(authorID)
        await publication.save()
        res.status(200).send({publication: publication})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

export const getPublication = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try {
        let publicationID = req.body.publicationID
        let publication = await Publication.find({'_id': publicationID})
        console.log(publication)
        res.status(200).send({publication: publication})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

export const getDrafts = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try {
        let publisherID = req.body.publisherID
        console.log(publisherID)
        let drafts = await Publication.find({
            'status': 'Draft',
            'publisher': publisherID
        })
        console.log("YEET")
        res.status(200).send({drafts: drafts})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

export const editDraft = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try {
        let draftID = req.body.draftID
        let authorID = req.body.authorID
        let author = await User.findOne({'_id': authorID})
        let title = req.body.title
        let description = req.body.description
        let topic = req.body.topic
        let locations = req.body.locations
        let tags = req.body.tags
        let content = req.body.article
        let authors = []
        let currentAuthorsID = []
        let publication = await Publication.findOne({'_id': draftID}, 
            function(err, obj) {
                authors = obj.authors
                for (var i=0;i<authors.length;i++) {
                    currentAuthorsID.push(authors[i]._id.toString())
                }
                console.log(currentAuthorsID)
                console.log(authorID)
                if(currentAuthorsID.includes(authorID)) {
                    console.log("Author is already included")
                }
                else {
                    console.log("Author is added")
                    authors.push(author)
                }
            }
        )
        let publicationNew = await Publication.findOneAndUpdate({
            '_id': draftID
            },
            {
                authors: authors,
                datePublished: Date.now(),
                title: title,
                description: description,
                topic: topic,
                locations: locations,
                tags: tags,
                article: content
            }
        )
        console.log(publicationNew)
        await publicationNew.save()
        res.status(200).send({publication: publicationNew})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

export const publishDraft = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try {
        let draft = req.body.draft
        let draftID = req.body.draft._id
        let approver = req.body.approver
        let authors = []
        let publication = await Publication.findOneAndUpdate({'_id': draftID}, {
            'status': 'Published',
            'datePublished': Date.now(),
            'approver': approver
        }, function(err, obj) {
            authors = obj.authors
        })
        console.log("Draft to be published: ", publication)
        await publication.save()
        await User.updateMany({'_id': {$in: authors}}, {$inc: {'rep': 1}})
        res.status(200).send({publication: publication})

    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

export const newRevision = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try {
        let publicationID = req.body.publicationID
        let authorID = req.body.authorID
        let publisherID = req.body.publisherID
        let prevVersions = req.body.prevVersions
        prevVersions.push(publicationID)
        let author = await User.findOne({'_id': authorID})
        let title = req.body.title
        let description = req.body.description
        let topic = req.body.topic
        let locations = req.body.locations
        let tags = req.body.tags
        let content = req.body.article
        let flaggerID = req.body.flaggerID
        let flagID = req.body.flagID
        let authors = []
        let currentAuthorsID = []
        let publication = await Publication.findOne({'_id': publicationID}, 
            function(err, obj) {
                authors = obj.authors
                for (var i=0;i<authors.length;i++) {
                    currentAuthorsID.push(authors[i]._id.toString())
                }
                console.log(currentAuthorsID)
                console.log(authorID)
                if(currentAuthorsID.includes(authorID)) {
                    console.log("Author is already included")
                }
                else {
                    console.log("Author is added")
                    authors.push(author)
                }
            }
        )
        let oldVersion = await Publication.findOneAndUpdate({
            '_id': publicationID
            },
            {
                revised: true
            }
        )
        await oldVersion.save()
        console.log("Previous Versions: ", prevVersions)
        var revisedPublication 
        if (flaggerID != null) {
            var flag = await Publication.findOneAndUpdate({'flags._id': flagID}, {
                'flags.$.status': "Accepted"
            })
            await flag.save()
            var flags = {}
            let newPublication = await Publication.findOne({
                '_id': publicationID
            },
            function(err, obj) {
                flags = obj.flags
            })
            revisedPublication = new Publication({
                title: title,
                description: description,
                topic: topic,
                locations: locations,
                tags: tags,
                article: content,
                authors: authors,
                publisher: publisherID,
                status: 'Published',
                prevVersions: prevVersions,
                flagger: flaggerID,
                flags: flags
            })
        }
        else {
            revisedPublication = new Publication({
                title: title,
                description: description,
                topic: topic,
                locations: locations,
                tags: tags,
                article: content,
                authors: authors,
                publisher: publisherID,
                status: 'Published',
                prevVersions: prevVersions
            })
        }
        await revisedPublication.save()
        await User.updateMany({'_id': authorID}, {$inc: {'rep': 1}})
        res.status(200).send({publication: revisedPublication})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

export const getNews = async (req, res) => {
    try {
        let published = await Publication.find({
            'status': 'Published',
            'revised': false
        })
        res.status(200).send({news: published})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Fetching");
    }
}

export const submitFlag = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try{
        const publicationID = req.body.publicationID
        const flagSubject = req.body.flagSubject;
        const userID = req.body.userID;
        const username = req.body.username;
        const flagWriteup = req.body.flagWriteup;
        let flags = []
        let flagIndex = 0
        let evidenceName = ""
        let publicationFetch = await Publication.findOne({'_id': publicationID},
            function (err, obj) {
                flags = obj.flags
                flagIndex = obj.flags.length
                evidenceName = req.body.publicationID + "_" + req.body.userID + "_" +
                req.body.flagIndex + "_" + req.body.filename
            })
        var newFlag = {
            subject: flagSubject,
            dateSubmitted: Date.now(),
            status: "Pending",
            flaggerID: userID,
            flaggerUsername: username,
            violationProof: evidencePath + "/" + evidenceName,
            writeup: flagWriteup
        }
        flags.push(newFlag)
        let publication = await Publication.findOneAndUpdate({'_id': publicationID},
        {flags: flags})
        await publication.save()
        res.status(200).send({publication: publication})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

export const getFlag = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try{
        const flagID = req.body.flagID;
        var flag = {}
        let publication = await Publication.findOne({
            'flags._id': flagID}, 
            {
                flags: {
                    $elemMatch: {'_id': flagID}
                }
            },
            function(err, obj) {
                flag = obj.flags[0]
            })
        console.log("Flag", flag)
        res.status(200).send({flag: flag})
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}

export const submitCounterFlag = async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    try{
        const publicationID = req.body.publicationID
        const userID = req.body.userID;
        const flagID = req.body.flagID;
        const counterFlagWriteup = req.body.counterFlagWriteup;
        let publication = await Publication.findOneAndUpdate({
            '_id': publicationID,
            'flags._id': flagID
        },
        {
            'flags.$.status': "Rejected",
            'flags.$.counterFlag.submitter': userID,
            'flags.$.counterFlag.writeup': counterFlagWriteup,
            'flags.$.counterFlag.dateSubmitted': Date.now()
        })
        await publication.save()
        res.status(200)
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}
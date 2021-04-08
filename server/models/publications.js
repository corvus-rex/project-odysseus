import mongoose from 'mongoose';

const PublisherSchema = mongoose.Schema({
    name: String,
    logo: String,
    createdAt: Date,
    chiefOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    authors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    rep: {
        type: Number,
        default: 0
    }
});

const PublicationSchema = mongoose.Schema({
    title: String,
    description: String,
    datePublished: Date,
    revised: Boolean,
    prevVersions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publication'
    }],
    topic: String,
    tags: [String],
    locations: [String],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publisher'
    },
    img: String,
    article: String,
    rep: {
        type: Number,
        default: 0
    },
    backers: [{
        backerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        amount: Number
    }],
    flags: [{
        subject: String,
        dateSubmitted: Date,
        flagger: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: String,
        writeup: String,
        violationProof: String,
        counterFlag: {
            dateSubmitted: Date,
            submitter: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            writeup: String,
            rep: {
                type: Number,
                default: 0
            }
        }
    }]
});

export const Publisher = mongoose.model('Publisher', PublisherSchema);
export const Publication = mongoose.model('Publication', PublicationSchema);
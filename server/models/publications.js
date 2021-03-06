import mongoose from 'mongoose';

const PublisherSchema = mongoose.Schema({
    name: String,
    logo: String,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    chiefOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    authors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    pendingAuthors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    acceptedAuthors: [{
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
    datePublished: {
        type: Date,
        default: Date.now()
    },
    revised: {
        type: Boolean,
        default: false
    },
    chainID: {
        type: Number,
        default: -1
    },
    prevVersions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publication'
    }],
    flagger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    topic: String,
    tags: [String],
    locations: [String],
    status: {
        type: String,
        default: "Draft"
    },
    authors: [Object],
    approver: {
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
        default: 1
    },
    upvoted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvoted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    flags: [{
        subject: String,
        dateSubmitted: Date,
        chainID: Number,
        expirySeconds: {
            type: Number,
            default: 7200
        },
        flaggerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        flaggerUsername: String,
        status: String,
        writeup: String,
        violationProof: String,
        counterFlag: {
            dateSubmitted: {
                type: Date,
                default: Date.now()
            },
            submitter: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            writeup: String,
            rep: {
                type: Number,
                default: 0
            },
            upvoted: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }],
            downvoted: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }],
        }
    }]
});

export const Publisher = mongoose.model('Publisher', PublisherSchema);
export const Publication = mongoose.model('Publication', PublicationSchema);

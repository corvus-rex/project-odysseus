import express from 'express';
import {registerPublisher, getPublisher, 
    findPublisherByID, acceptAuthorship, revokeAuthor, registerAuthor,
    newDraft, getPublication, getDrafts, editDraft, getPublishedList,
    publishDraft, newRevision, getNews, submitFlag, 
    getFlag, submitCounterFlag, castVote, castVoteCF} from '../controllers/publications.js'
import {uploadEvidence, uploadLogo} from '../controllers/middleware.js'
import {check} from 'express-validator';

const router = express.Router();
const app = express();
app.use(express.json());

router.post('/new', 
    uploadLogo.fields([{name: 'logo', maxCount:1}]),
    registerPublisher);
router.post('/', [], getPublisher);
router.post('/findByID', [], findPublisherByID);
router.post('/accept-author', [], acceptAuthorship)
router.post('/revoke-author', [], revokeAuthor)
router.post('/register-author', [], registerAuthor)
router.post('/publish-draft', [], publishDraft)
router.post('/new-revision', [], newRevision)
router.get('/get-news', getNews)
router.post('/get-published-list', [], getPublishedList)
router.post('/new-draft', [], newDraft)
router.post('/get-publication', [], getPublication)
router.post('/get-drafts', [], getDrafts)
router.post('/edit-draft', [], editDraft)
router.post('/get-flag', [], getFlag)
router.post('/submit-flag', 
    uploadEvidence.fields([{name: 'flagEvidence', maxCount: 1}]),
    submitFlag)
router.post('/submit-counterflag', submitCounterFlag)
router.post('/cast-vote', castVote)
router.post('/cast-vote-cf', castVoteCF)

export default router;
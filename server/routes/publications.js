import express from 'express';
import {registerPublisher, getPublisher, 
    findPublisherByID, acceptAuthorship, revokeAuthor,
    newDraft, getPublication, getDrafts, editDraft, getPublishedList,
    publishDraft, newRevision} from '../controllers/publications.js'
import {check} from 'express-validator';

const router = express.Router();
const app = express();
app.use(express.json());

router.post('/new', [], registerPublisher);
router.post('/', [], getPublisher);
router.post('/findByID', [], findPublisherByID);
router.post('/accept-author', [], acceptAuthorship)
router.post('/revoke-author', [], revokeAuthor)
router.post('/publish-draft', [], publishDraft)
router.post('/new-revision', [], newRevision)
router.post('/get-published-list', [], getPublishedList)
router.post('/new-draft', [], newDraft)
router.post('/get-publication', [], getPublication)
router.post('/get-drafts', [], getDrafts)
router.post('/edit-draft', [], editDraft)

export default router;
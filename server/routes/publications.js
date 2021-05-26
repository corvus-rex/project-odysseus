import express from 'express';
import {registerPublisher, getPublisher, 
    findPublisherByID, acceptAuthorship, revokeAuthor,
    newDraft, getDraft, getDrafts, editDraft} from '../controllers/publications.js'
import {check} from 'express-validator';

const router = express.Router();
const app = express();
app.use(express.json());

router.post('/new', [], registerPublisher);
router.post('/', [], getPublisher);
router.post('/findByID', [], findPublisherByID);
router.post('/accept-author', [], acceptAuthorship)
router.post('/revoke-author', [], revokeAuthor)
router.post('/new-draft', [], newDraft)
router.post('/get-draft', [], getDraft)
router.post('/get-drafts', [], getDrafts)
router.post('/edit-draft', [], editDraft)

export default router;
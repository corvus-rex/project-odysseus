import express from 'express';
import {registerPublisher, getPublisher, findPublisherByID, acceptAuthorship, revokeAuthor} from '../controllers/publications.js'
import {check} from 'express-validator';

const router = express.Router();
const app = express();
app.use(express.json());

router.post('/new', [], registerPublisher);
router.post('/', [], getPublisher);
router.post('/findByID', [], findPublisherByID);
router.post('/accept-author', [], acceptAuthorship)
router.post('/revoke-author', [], revokeAuthor)

export default router;
import express from 'express';
import {registerPublisher, getPublisher, findPublisherByID, acceptAuthorship} from '../controllers/publications.js'
import {check} from 'express-validator';

const router = express.Router();
const app = express();
app.use(express.json());

router.post('/new', [], registerPublisher);
router.post('/', [], getPublisher);
router.post('/findByID', [], findPublisherByID);
router.post('/accept-author', [], acceptAuthorship)

export default router;
import express from 'express';
import {inviteAuthor, getUserNotifs, changeStatus} from '../controllers/notifs.js'
import {check} from 'express-validator';

const router = express.Router();
const app = express();
app.use(express.json());

router.post('/invite-auth', [], inviteAuthor);
router.post('/get-notifs', [], getUserNotifs);
router.post('/change-status', [], changeStatus);

export default router;
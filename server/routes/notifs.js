import express from 'express';
import {inviteAuthor} from '../controllers/notifs.js'
import {check} from 'express-validator';

const router = express.Router();
const app = express();
app.use(express.json());

router.post('/invite-auth', [], inviteAuthor);

export default router;
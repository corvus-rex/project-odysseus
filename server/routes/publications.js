import express from 'express';
import {registerPublisher} from '../controllers/publications.js'
import {check} from 'express-validator';

const router = express.Router();
const app = express();
app.use(express.json());

router.post(
    '/new',
    [],
    registerPublisher
);

export default router;
import express from 'express';
import {registerPublisher} from '../controllers/publications.js'
import {check} from 'express-validator';

const router = express.Router();
const app = express();
app.use(express.json());

router.post(
    '/new',
    [
        check('name', 'Please enter a valid publisher name')
        .notEmpty()
    ],
    registerPublisher
);

export default router;
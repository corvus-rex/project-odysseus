import express from 'express';
import {signup, login, auth} from '../controllers/users.js';
import {check} from 'express-validator';

const router = express.Router();
const app = express();
app.use(express.json());

router.post(
    '/signup', 
    [
        check('username', "Enter a valid username")
        .notEmpty(),
        check('email', "Enter a valid email")
        .isEmail().notEmpty(),
        check('password', "Enter a valid password")
        .isLength({min:8}).notEmpty()
    ],
    signup
);

router.post(
    '/login',
    [
        check('email', 'Please enter a valid email')
        .isEmail(),
        check('password', 'Please enter a valid password')
        .isLength({min:8}).notEmpty()
    ],
    login
);

router.get("/profile", auth);

export default router;
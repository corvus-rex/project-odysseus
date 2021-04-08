import {validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User} from '../models/users.js';

export const signup = async (req,res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    };
    const {username, email, password, firstName, lastName} = req.body;
    try {
        let user = await User.findOne({email});
        if (user) {
            return res.status(400).json({msg: "User with same email already exist"});
        };
        user = await User.findOne({username});
        if (user) {
            return res.status(400).json({msg: "User with same username already exist"});
        };

        user = new User({username, email, password, firstName, lastName});
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {
            user: {id: user.id}
        };

        jwt.sign(
            payload,
            "randomString", {
                expiresIn: 10000
            },
            (err, token) => {
                if (err) throw err;
                res.status(200).send({auth: true, user: user, token: token});
            }
        );
    }
    catch (error) {
        console.log(error.message);
        res.status(500).send("Error in Saving");
    }
}

export const login = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({
                message: "User does not exist, please register"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload, 
            "randomString",
            {
                expiresIn: 3600
            },
            (err, token) => {
                if (err) throw err;
                res.status(200).send({auth: true, user: user, token: token});
            }
        );
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Server error"});
    }
}

export const auth = async (req, res) => {
    const token = req.header("token");
    console.log(typeof(token));
    if (!token) {
      return res.status(401).json({ message: "Auth Error" });
    }
  
    try {
      const decoded = jwt.verify(token, 'randomString');
      console.log(decoded);
      var username = decoded.user;
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: "Invalid Token" });
    }
    console.log(username)
    try {
      // request.user is getting fetched from Middleware after token authentication
      const user = await User.findById(username.id);
      res.json(user);
    } catch (e) {
      res.send({ message: "Error in Fetching user" });
    }
  
  };
const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter
    .post('/signin', jsonBodyParser, (req, res, next) => {
        const { user_name, password } = req.body;
        const signinUser = { user_name, password };

        for(const [key, value] of Object.entries(signinUser)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
            }
        }
    })
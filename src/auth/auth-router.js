const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const jsonBodyParser = express.json();

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

authRouter
  .post('/signin', jsonBodyParser, (req, res, next) => {
    const { user_name, password } = req.body;
    const signinUser = { user_name, password };

    for (const [key, value] of Object.entries(signinUser)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });
      }
    }

    AuthService.getUserWithUserName(
      req.app.get('db'),
      signinUser.user_name,
    )
      .then((dbUser) => {
        if (!dbUser) {
          return res.status(400).json({
            error: 'Incorrect user_name or password',
          });
        }

        return AuthService.comparePasswords(signinUser.password, dbUser.password)
          .then((compareMatch) => {
            if (!compareMatch) {
              return res.status(400).json({
                error: 'Incorrect user_name or password',
              });
            }

            const sub = dbUser.user_name;
            const payload = {
              user_id: dbUser.id,
            };
            res.send({
              authToken: AuthService.createJwt(sub, payload),
            });
          });
      })
      .then((user) => {
        res.status(user).json(getCircularReplacer());
      })
      .catch(next);
  });

module.exports = authRouter;

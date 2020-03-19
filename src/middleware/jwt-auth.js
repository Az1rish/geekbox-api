const AuthService = require('../auth/auth-service');

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || '';
// console.log(`Auth: ${authToken}`);
    let bearerToken;
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({
            error: 'Missing bearer token'
        });
    } else {
        bearerToken = authToken.slice(7, authToken.length);
    }
// console.log(`BearerToken: ${bearerToken}`);
    try {
        // console.log(`bearer in try: ${bearerToken}`)
        const payload = AuthService.verifyJwt(bearerToken);
// console.log(`Payload: ${payload}`);
        AuthService.getUserWithUserName(
            req.app.get('db'),
            payload.sub,
        )
            .then(user => {
                if (!user) 
                    return res.status(401).json({
                    error: 'Unauthorized request - No User'
                });

                req.user = user;
                next();
            })
            .catch(err => {
                console.log(err)
                next(err);
            });
    } catch (error) {
        res.status(401).json({
            error: 'Unauthorized request'
        });
    }
}

module.exports = requireAuth;
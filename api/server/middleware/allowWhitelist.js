module.exports = function(allowedDomains) {
    return function(req, res, next) {
        const requestOrigin = req.get('Origin');
        // if (allowedDomains.includes(requestOrigin)) {
        //     res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        //     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        //     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        //     res.setHeader('Access-Control-Allow-Credentials', 'true');
        // } else {
        //     // res.status(403).send('Forbidden - Cross-Origin Request Blocked');
        //     return res.status(403).send('Forbidden - Cross-Origin Request Blocked');
        // }
        next();
    };
};
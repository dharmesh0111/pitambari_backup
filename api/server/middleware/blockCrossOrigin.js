module.exports = function() {
    return function(req, res, next) {

// // Check the Origin header and reject if it's present and not from your domain
//         const requestOrigin = req.get('Origin');
//         const allowedOrigin = 'http://172.105.55.218'; // Replace with your domain

//     	// console.log("requestOrigin ",requestOrigin)
//         if (requestOrigin && requestOrigin !== allowedOrigin) {
//             return res.status(403).send('Forbidden - Cross-Origin Request Blocked');
//         }

// instead f blocking the origin, whitelist it
        next();
    };
};
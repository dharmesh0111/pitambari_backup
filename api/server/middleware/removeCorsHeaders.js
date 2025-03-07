module.exports = function() {
    return function(req, res, next) {
    	// console.log("remove cors headers")

        // res.setHeader('Access-Control-Allow-Origin', '');
        // res.setHeader('Access-Control-Allow-Credentials', '');

        // res.removeHeader('Access-Control-Allow-Origin');
        // res.removeHeader('Access-Control-Allow-Credentials');
        // You might need to remove other CORS-related headers if present

        next();
    };
};
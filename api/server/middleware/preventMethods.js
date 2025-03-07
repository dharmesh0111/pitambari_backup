module.exports = function() {
  return function(req, res, next) {
    if (req.method === 'PUT' || req.method === 'DELETE' || req.method === 'PATCH') {
      return res.status(403).send('Method Not Allowed');
    }
    next();
  };
};
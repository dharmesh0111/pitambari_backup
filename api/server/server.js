// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');

// const logger = require('./utils/logger');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const xssFilter = require('x-xss-protection');
const rateLimit = require('express-rate-limit');

var morgan = require('morgan');
var fs = require('fs');

const app = module.exports = loopback();


var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' });

// Set up request logging using Morgan
app.use(morgan('combined', { stream: accessLogStream }));

// app.use(morgan('dev'));
// Use middleware to prevent XSS
app.use(cookieParser());
app.use(bodyParser.json());
app.use(xssFilter());


const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// store: ... , // Use an external store for more precise rate limiting
})

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

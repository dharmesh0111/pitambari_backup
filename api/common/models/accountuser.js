'use strict';

const speakeasy = require('speakeasy');
const globals = require('../../server/myglobal'); // << globals.js path
const g = require('loopback/lib/globalize');
const path = require('path');
const moment = require('moment');

module.exports = function(AccountUser) {
  if (typeof AccountUser.remoteMethod === 'function') {
    // Validation Start
    AccountUser.validate('email', checkEmpty, { message: globals.validation_msg.empty });
    AccountUser.validate('password', checkEmptypassword, { message: globals.validation_msg.empty });

    function checkEmpty(err) {
      if ((this.email).trim() === '') err();
    }

    function checkEmptypassword(err) {
      if ((this.password).trim() === '') err();
    }

    AccountUser.validatePassword = function(plain) {
      var err,
        passwordProperties = AccountUser.definition.properties.password;

      if (plain.length > passwordProperties.max) {
        err = new Error(g.f('Password too long: %s (maximum %d symbols)', plain, passwordProperties.max));
        err.code = 'PASSWORD_TOO_LONG';
      } else if (plain.length < passwordProperties.min) {
        err = new Error(g.f('Password too short: %s (minimum %d symbols)', plain, passwordProperties.min));
        err.code = 'PASSWORD_TOO_SHORT';
      } else if (!(new RegExp(passwordProperties.pattern, 'g').test(plain))) {
        err = new Error(g.f('Invalid password: %s (symbols and numbers are allowed)', plain));
        err.code = 'INVALID_PASSWORD';
      } else {
        return true;
      }
      err.statusCode = 422;
      throw err;
    };

    // Allow login if email is verified
    AccountUser.afterRemote('login', function(context, user, next) {
      AccountUser.findById(context.result.userId, function(err, appUserObject) {
        if (appUserObject.emailVerified) {
          next();
        } else {
          var cerr = new Error(g.f(globals.validation_msg.user_incmplt_exist));
          cerr.code = 'USER_NOT_EXIST';
          return next(cerr);
        }
      });
    });

    // Define remote method for listing users
    AccountUser.remoteMethod(
      'list', {
        http: {
          path: '/list',
          verb: 'get',
        },
        accepts: [
          {
            arg: 'filter',
            type: 'object'
          }
        ],
        documented: true,
        description: 'Get all account users',
        returns: {
          arg: 'list',
          type: 'array',
          root: true
        }
      }
    );

    AccountUser.list = function(filterobj, cb) {
      var ds = AccountUser.dataSource;

      var sql = `
        SELECT accountuser.*
        FROM accountuser
        ORDER BY accountuser.id DESC
      `;

      ds.connector.query(sql, function(err, result) {
        if (err) {
          cb(err, []);
        } else {
          if (result != null && result != "") {
            cb(err, result);
          } else {
            cb(err, []);
          }
        }
      });
    };

    AccountUser.remoteMethod(
      'checkGoogleUser', {
        http: {
          path: '/checkGoogleUser',
          verb: 'post',
        },
        accepts: [
          {
            arg: 'email',
            type: 'string',
            required: true,
            description: 'User email to check',
          },
        ],
        returns: {
          arg: 'result',
          type: 'object',
          root: true,
        },
      }
    );

    AccountUser.checkGoogleUser = function (email, cb) {
      AccountUser.findOne({ where: { email: email } }, function (err, user) {
        if (err) {
          return cb(err);
        }
        if (user) {
          return cb(null, { exists: true, user: user });
        } else {
          return cb(null, { exists: false });
        }
      });
    };

    // Define the remote method for updating a user
    AccountUser.remoteMethod(
      'updateUser', {
        http: {
          path: '/:id/updateUser',
          verb: 'post',
        },
        accepts: [
          {
            arg: 'id',
            type: 'number',
            required: true,
            description: 'User ID',
          },
          {
            arg: 'data',
            type: 'object',
            http: { source: 'body' },
            required: true,
            description: 'User data to update',
          },
        ],
        returns: {
          arg: 'result',
          type: 'object',
          root: true,
        },
      }
    );

    AccountUser.updateUser = function (id, data, cb) {
      console.log('Updating user with ID:', id);
      console.log('Data to update:', data);

      // Validate the data
      if (!data.email || !data.username || !data.location) {
        var err = new Error('Invalid data provided');
        err.statusCode = 400; // Bad Request
        return cb(err);
      }

      // Find the user by ID
      AccountUser.findById(id, function (err, userInstance) {
        if (err) {
          console.error('Error finding user:', err);
          return cb(err);
        }

        if (!userInstance) {
          var notFoundErr = new Error('User not found');
          notFoundErr.statusCode = 404;
          return cb(notFoundErr);
        }

        // Prepare the payload for updating the user
        var userPayload = {
          email: data.email ? data.email.trim() : userInstance.email,
          username: data.username ? data.username.trim() : userInstance.username,
          realm: data.realm ? data.realm.trim() : userInstance.realm,
          location: data.location ? data.location.trim() : userInstance.location,
          lastUpdatedAt: moment().toISOString() // Update the timestamp
        };

        console.log('User payload:', userPayload);

        // Update the user attributes
        userInstance.updateAttributes(userPayload, function (updateErr, updatedInstance) {
          if (updateErr) {
            console.error('Error updating user:', updateErr);
            return cb(updateErr);
          }

          console.log('User updated successfully:', updatedInstance);
          return cb(null, { status: 'success', message: 'User updated successfully.', user: updatedInstance });
        });
      });
    };

    AccountUser.remoteMethod(
      'addUser', {
        http: {
          path: '/adduser',
          verb: 'post',
        },
        accepts: [
          {
            arg: 'data',
            type: 'object',
            http: { source: 'body' },
            required: true,
            description: 'User data to add',
          },
        ],
        returns: {
          arg: 'result',
          type: 'object',
          root: true,
        },
      }
    );

    AccountUser.addUser = function (data, cb) {
      console.log('Adding new user:', data);

      // Validate the data
      if (!data.username || !data.password || !data.email || !data.realm || !data.location) {
        var err = new Error('Invalid data provided');
        err.statusCode = 400; // Bad Request
        return cb(err);
      }

      // Prepare the payload for creating the user
      var userPayload = {
        username: data.username ? data.username.trim() : '',
        password: data.password ? data.password.trim() : '',
        email: data.email ? data.email.trim() : '',
        realm: data.realm ? data.realm.trim() : '',
        location: data.location ? data.location.trim() : '',
        emailVerified: 1, // Set emailVerified to 1 by default
        createdAt: moment().toISOString(), // Add creation timestamp
        lastUpdatedAt: moment().toISOString() // Add last updated timestamp
      };

      console.log('User payload:', userPayload);

      // Create the new user
      AccountUser.create(userPayload, function (err, newUser) {
        if (err) {
          console.error('Error adding user:', err);
          cb(err);
        } else {
          console.log('User added successfully:', newUser);
          cb(null, { status: 'success', message: 'User added successfully.', user: newUser });
        }
      });
    };

    // Define the remote method for fetching line items by invoice ID
    AccountUser.remoteMethod(
      'itemlist', {
        http: {
          path: '/itemlist',
          verb: 'get',
        },
        accepts: [
          {
            arg: 'invoice_id',
            type: 'number',
            required: true,
            description: 'Invoice ID to filter line items',
          }
        ],
        documented: true,
        description: 'Get line items for a specific invoice ID.',
        returns: {
          arg: 'report',
          type: 'array',
          root: true
        }
      }
    );

    AccountUser.itemlist = function (invoice_id, cb) {
      var ds = AccountUser.dataSource;

      var sql = `
        SELECT * FROM lineitems
        WHERE invoice_id = ?
      `;

      ds.connector.query(sql, [invoice_id], function (err, result) {
        if (err) {
          console.error('Error executing query:', err);
          cb(err, []);
        } else {
          cb(null, result);
        }
      });
    };

  } else {
    console.error('AccountUser is not a valid LoopBack model.');
  }
};

'use strict';

const speakeasy = require('speakeasy');
const globals = require('../../server/myglobal'); // << globals.js path
const g = require('loopback/lib/globalize');
const path = require('path');
const moment= require('moment') ;
//const request = require('request');
module.exports = function(Accountuser) {

    
    //Validation Start
    Accountuser.validate('email', checkEmpty, {message: globals.validation_msg.empty});// check for empty string (custom method)

    Accountuser.validate('password', checkEmptypassword, {message: globals.validation_msg.empty});// check for empty string (custom method)
    
    function checkEmpty(err) {
        if ((this.email).trim() === '') err();
    };
    
    function checkEmptypassword(err) {
        if ((this.password).trim() === '') err();
    };

    Accountuser.validatePassword = function(plain) {
        var err,
            passwordProperties = Accountuser.definition.properties.password;
    
        if (plain.length > passwordProperties.max) {
            err = new Error (g.f('Password too long: %s (maximum %d symbols)', plain, passwordProperties.max));
            err.code = 'PASSWORD_TOO_LONG';
        } else if (plain.length < passwordProperties.min) {
            err = new Error(g.f('Password too short: %s (minimum %d symbols)', plain, passwordProperties.min));
            err.code = 'PASSWORD_TOO_SHORT';
        } else if(!(new RegExp(passwordProperties.pattern, 'g').test(plain))) {
            err =  new Error(g.f('Invalid password: %s (symbols and numbers are allowed)', plain));
            err.code = 'INVALID_PASSWORD';
        } else {
            return true;
        }
        err.statusCode = 422;
        throw err;
    };

    function isNumeric(num){
        return !isNaN(num)
    }
    //Validattion End


    
    // allow login if email is verified
    Accountuser.afterRemote('login', function(context, user, next) {
        // check if user is exist or not
    	Accountuser.findById(context.result.userId, function (err, appUserObject) {
	        console.log("emailVerified ",appUserObject.emailVerified);
	        console.log("appUserObject ",appUserObject);

	        if(appUserObject.emailVerified){
                // allow login
	        	next();
	        }else{
                // prevent login
                var cerr = new Error (g.f(globals.validation_msg.user_incmplt_exist));
                cerr.code = 'USER_NOT_EXIST'; 
                return next(cerr);
	        }
        });
    });


};

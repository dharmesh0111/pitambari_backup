'use strict';

var globals = require('../../server/myglobal'); // << globals.js path

var g = require('loopback/lib/globalize');
const xss = require('xss');
// var app = require('../../server/server');
const logger = require('../../server/utils/logger');

module.exports = function(License) {
    


    //All License List
    License.remoteMethod(
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
            documented: true, //false : hide from openApi , true : show on api
            description: 'Get  all invoices',
            returns: {
                arg: 'list',
                type: 'array',
                root: true
            }
        }
    );

    License.list = function (filterobj,cb) {
        console.log(filterobj);
        var ds = License.dataSource;

        
                var sql = "SELECT * " + 
                    " FROM license " +
                    " ORDER BY id desc ";
                    ;
                console.log(sql);
                ds.connector.query(sql, function (err, result)
                {
                    if (err){
                        cb(err, []);
                    }else{
                        if(result !=null && result !="" ){
                            // return result ;
                            cb(err,result);
                        }else{
                            cb(err,[]);
                        }
                    }
                });

    }



};

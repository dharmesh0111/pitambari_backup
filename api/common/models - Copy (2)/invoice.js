'use strict';

var globals = require('../../server/myglobal'); // << globals.js path

var g = require('loopback/lib/globalize');
const xss = require('xss');
const moment= require('moment') ;
// var app = require('../../server/server');
const logger = require('../../server/utils/logger');

var multer = require('multer');
var fs = require("fs"); // folder creation
var path = require('path');

module.exports = function(Invoice) {
    
    Invoice.remoteMethod('updateinvoice', {
        http: {
            path: '/:token/updateinvoice',
            verb: 'post',
            status: 200,
            errorStatus: 400
        },
        accepts: [                   
            {
                arg: 'token',
                type: 'string',
                required : true, 
                description: 'contact Id',
            },           
            {
                arg: 'data',
                type: 'object',
                http: {
                    source: 'body',
                    status: 200,
                    errorStatus: 400
                },
                required : true, 
                description: 'data include customer name, phone no, comany name, company address,designation,company type',
            },
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    });


    Invoice.updateinvoice = function (ntoken,payload,cb) {

        
        console.log(payload);
        var derr = new Error (g.f(globals.validation_msg.wrongmsg));
        derr.code = 'Error'; 
        // cerr.statusCode = 401;  
        ntoken = Buffer.from(ntoken, 'base64').toString() ;

        // var Company = app.models.company;
        Invoice.findOne({where:{"id": ntoken}})
            .then(invinstance => {
             console.log(invinstance);
            if(invinstance){

                return new Promise((resolve, reject) => {
                    var invpayload = {
                        "invoice-number": payload['invoiceno'] !=null ? (payload['invoiceno']).trim() : "",
                        "invoice-date": payload['invoice-date'] !=null ? (payload['invoice-date']).trim() : "",
                        "grand-total": payload['grandtotal'] !=null ? (payload['grandtotal']).trim() : "",
                        "barcode-number": payload['barcode'] !=null ? (payload['barcode']).trim() : "",
                        "isvalidated": payload['isvalidated'] !=null ? (payload['isvalidated']).trim() : "0",
                        "lastUpdatedAt": moment()
                    }
                    console.log("invpayload ",invpayload);
                    invinstance.updateAttributes(invpayload, function(inverr, invResult) {
                        if (inverr){ 
                            reject(inverr);
                        }else{
                            console.log("invResult ",invResult);
                            resolve({"status":"success","message":"Order confirmed successfully."});
                        }
                       });
                       
                });
            }else{

                var cerr = new Error (g.f(globals.validation_msg.RECORD_NOT_EXIST));
                cerr.code = 'INVOICE_NOT_EXIST'; 
                // cerr.statusCode = 401;  
                throw cerr;
            }
        
        })
        .then((rs) => cb(null, rs))
        .catch(err => cb(err));
       
    };
    

    Invoice.remoteMethod(
        'details', {
            http: {
                path: '/:token/details',
                verb: 'get',
            },
            accepts: [                   
                {
                    arg: 'token',
                    type: 'string',
                    required : true, 
                    description: 'token Id',
                }
            ],
            documented: true, //false : hide from openApi , true : show on api
            description: 'Get  orders',
            returns: {
                arg: 'list',
                type: 'array',
                root: true
            }
        }
    );

    
    Invoice.details = function (ntoken,cb) {
        
        ntoken = Buffer.from(ntoken, 'base64').toString() ;
        var ds = Invoice.dataSource;

        
        var sql = "SELECT * " + 
            " FROM invoice " +
            " where id = ? "+
            " ORDER BY id desc ";
            ;

        ds.connector.query(sql,[ntoken], function (err, result)
        {
            if (err){
                cb(err, null);
            }else{
                if(result !=null && result[0] !=null && result[0] !="" ){
                    // return result ;
                    cb(err,result[0]);
                }else{
                    cb(err,null);
                }
            }
        });
    }   

    //All Invoice List
    Invoice.remoteMethod(
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

    Invoice.list = function (filterobj,cb) {

        var ds = Invoice.dataSource;

        
                var sql = "SELECT * " + 
                    " FROM invoice " +
                    " ORDER BY id desc ";
                    ;

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

    //Dashboard Count
    Invoice.remoteMethod(
        'dashboardcount', {
            http: {
                path: '/dashboardcount',
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

    Invoice.dashboardcount = function (filterobj,cb) {
        var ds = Invoice.dataSource;

        
                var sql = "SELECT IFNULL(sum(CASE WHEN status ='1' or status = '2' or status = '3' then 1 else 0 end ),0) as `processed-count`, " + 
                    " IFNULL(sum(CASE WHEN status ='2' then 1 else 0 end ),0) as `extracted-count`, "+
                    " IFNULL(sum(CASE WHEN status ='3' then 1 else 0 end ),0) as `nonextracted-count` "+
                    " FROM invoice "+
                    " ORDER BY id desc ";
                    ;

                ds.connector.query(sql, function (err, result)
                {
                    if (err){
                        cb(err, null);
                    }else{
                        if(result !=null && result[0] !=null ){
                            // return result ;
                            cb(err,result[0]);
                        }else{
                            cb(err,null);
                        }
                    }
                });

    }


    //Dashboard Count
    Invoice.remoteMethod(
        'chartdata', {
            http: {
                path: '/chartdata',
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

    Invoice.chartdata = function (filterobj,cb) {

        var wherecond = "",groubytype="days",catformat = "YYYY-MM-DD",selecttype = "DATE(`processed-date`) as `idate` ,",groupby = " group by DATE(`processed-date`)";
        if (!(typeof filterobj === "undefined")) {
            
            if (filterobj.hasOwnProperty("fromdate") && filterobj['fromdate'] !=null && filterobj['fromdate'] !="" ) {
                // wherecond += " and DATE(date) >= '"+filterobj['fromdate'] +"'";
                wherecond += " and DATE(`processed-date`) >= '"+filterobj['fromdate'] +"'";
            }
            if (filterobj.hasOwnProperty("todate") && filterobj['todate'] !=null && filterobj['todate'] !="" ) {
                // wherecond += " and DATE(date) <= '"+filterobj['todate'] +"'";
                wherecond += " and DATE(`processed-date`) <= '"+filterobj['todate'] +"'";
            }
            if (filterobj.hasOwnProperty("type") && filterobj['type'] !=null && filterobj['type'] !="" ) {
                // wherecond += " and DATE(date) <= '"+filterobj['todate'] +"'";
                groubytype =filterobj['type'] ;
            }
        }
        var ds = Invoice.dataSource;

            if(groubytype == "year"){
                catformat = "YYYY";
                selecttype = "YEAR(`processed-date`) as `idate` ,",groupby = " group by YEAR(`processed-date`)"
            }else if(groubytype == "month"){
                catformat = "YYYY-MM";
                // selecttype = "MONTH(`processed-date`) as `idate` ,",groupby = " group by MONTH(`processed-date`)"
                selecttype = "DATE_FORMAT(`processed-date`, '%Y-%m')  `idate` ,",groupby = " group by idate"
            }
                var sql = "SELECT "+selecttype+" IFNULL(sum(CASE WHEN status ='Processed' then 1 else 0 end ),0) as `processed-count`, " + 
                    " IFNULL(sum(CASE WHEN status ='Extracted' then 1 else 0 end ),0) as `extracted-count`, "+
                    " IFNULL(sum(CASE WHEN status ='Not Extracted' then 1 else 0 end ),0) as `nonextracted-count` "+
                    " FROM invoice where id is not null "+wherecond +
                    groupby+
                    // " group by DATE(`processed-date`) " +
                    " ORDER BY id desc ";
                    ;
                console.log(sql);
                ds.connector.query(sql, function (err, result)
                {
                    if (err){
                        cb(err, null);
                    }else{
                        if(result !=null ){
                            datewiseresult(result,catformat).then((countresult) => {
                                cb(err,countresult);
                            })
                        }else{
                            cb(err,null);
                        }
                    }
                });

    }

    async function datewiseresult(tparr,catformat) {
        var resultobj = {};

        for (const obj of tparr) {
            await new Promise(function(resolve, reject) {
                console.log(obj['idate']+" || "+catformat);
                var idate = moment(obj['idate']).format(catformat);
                console.log(idate);
                resultobj[idate] = {"processed-count":obj['processed-count'],"extracted-count":obj['extracted-count'],"nonextracted-count":obj['nonextracted-count']};
                resolve(1);
            });
        }

        return await resultobj;

    }


    Invoice.remoteMethod('uploadinvoice', {
        http: {
            path: '/uploadinvoice',
            verb: 'post',
            status: 200,
            errorStatus: 400
        },
        accepts: [  
                {
                    arg: 'req',
                    type: 'object',
                    http: {
                        source: 'req'
                    }
                }, {
                    arg: 'res',
                    type: 'object',
                    http: {
                        source: 'res'
                    }
                }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    });


    Invoice.uploadinvoice = function (req, res,cb) {

        console.log("uploadinvoice");
         
        
        var uploadedFileName = '';
        var storage = multer.diskStorage({
            destination: function (req, file, cb) {
                // checking and creating uploads folder where files will be uploaded                            
                var dbdir = "";
                    
                var dirPath = globals.documentdir+"pending" ;
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath);
                }
                
                cb(null, dirPath + '/');
            },
            filename: function (req, file, cb) {
                // file will be accessible in `file` variable
                var ext = file.originalname.substring(file.originalname.lastIndexOf("."));
                // var fileName = "invoice"+Date.now() + ext;
                var fileName = file.originalname;
                uploadedFileName = fileName;
                cb(null, fileName);
            }
        });
        var upload = multer({
            storage: storage,
            limits: { fileSize: globals.maxSize },                        
            fileFilter: function (req, file, cb) {
                    // console.log("fileFilter",req.body);
                var ext = path.extname(file.originalname);
                // var msgtype = (req!=null && req.body!=null && req.body.type !=null ? req.body.type : "");

                // if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                //     return cb(new Error('Only images are allowed'))
                // }
                // if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {

                if( (['jpg', 'png','pdf','jpeg'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1)) {
                    return callback(new Error('Wrong extension type'));
                }
                cb(null, true)
            }
        }).array('invoice-file', 12);

        upload(req, res, function (err) {
            if (err) {
                // An error occurred when uploading
                // res.json(err);
                cb(err);
                // throw err;
            } else {
                cb(null,{"status":"success","message":"FIle upload successfully."});
                // var invoicefile = "",invoiceurlfile = "",extension = "",displayname = "",originalname = "";
                
                // if(!req.files || !req.files[0]){

                // }else{
                //     if(req.files[0]['path']!=null){
                //         var docpath = req.files[0]['path'];
                //         invoicefile = docpath;
                        
                //         displayname = req.files[0]['filename'];
                //         originalname = req.files[0]['originalname'];

                //         docpath = docpath.replace(globals.documentdir, globals.documenturl);
                        
                //         invoiceurlfile = globals.documenturl+"pdf/"+displayname;
                //         var extarr =  invoicefile.split(".");
                //         extension = extarr[extarr.length - 1];
                //     }
                // }
                // // console.log("invoicefile",invoicefile);
                // // console.log("extension",extension);
                // var invPayload = {
                //     'filepath' : invoiceurlfile,
                //     'filename' : originalname,
                //     // 'extension' : extension,
                //     'extension' : extension
                // }
                // console.log("invPayload ",invPayload);
                // Invoice.create(invPayload, function (inverr, invresult) {
                    
                // // console.log("inverr ",inverr);
                // // console.log("invresult ",invresult);
                //     if (inverr) {
                //         cb(inverr);
                //     }else{
                //         cb(null,{"status":"success","message":"FIle upload successfully."});
                //     }
                // })

            }
        });  
                    
                    

    }

};

// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: generator-loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports = function(app) {

//  var lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role'];
// app.dataSources.mysqlDs.automigrate(lbTables, function(er) {
//  if (er) throw er;
 
// });
  
  
   var ds = app.datasources.mysqlDs;

   var modelArray = [
       "accountuser","invoice","license"
   ];
 modelArray.forEach(function (model) {
//        console.log("Model Name : "+model);
        app.dataSources.mysqlDs.isActual(model, function(err, actual) {
            if (!actual) { 
                //True when data source and database is in sync
                //console.log(model +" Actual : "+actual);            
                app.dataSources.mysqlDs.autoupdate(model, function(err, result) { 
                    if (err) throw err;
                    console.log('\nAutoupdated table `'+model+'`.');
                });
            }else{
                //console.log(model +' Table already sync');
            } 
        });
    }) ;
};

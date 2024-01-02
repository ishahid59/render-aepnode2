//MySql COnnection
const mysql = require('mysql');
const mysqlConnection = mysql.createConnection({

    // host     : 'localhost',
    // user     : 'root',
    // password : '',
    // // database : 'node12',
    // database : 'aep',
    // multipleStatements: true

   
 
    // host     : 'sql3.freemysqlhosting.net',
    // user     : 'sql3334151',
    // password : 'PSj3cNHnIJ',
    // database : 'sql3334151',
    // multipleStatements: true
    
  

    // host     : 'mysqlcluster19.registeredsite.com',
    // user     : 'ishahidnode',
    // password : 'Is#kse494',
    // database : 'ksepnode',
    // multipleStatements: true
 


    // host     : 'mysqlcluster27.registeredsite.com',
    // user     : 'ishahid_demo',
    // password : 'Is#kse494',
    // database : 'ksep_demo',
    // multipleStatements: true
          
     
     
    // host     : 'pmakf9two5d.registeredsite.com',
    // user     : 'ishahidnode2',
    // password : 'Is#kse494',
    // database : 'aep2',
    // multipleStatements: true 
     
      
    // // host   : '35.212.2.98',//
    // siteground working with allowing remote access for 202.125.75.202 in siteground website
    host     :'35.212.2.98',//'gvam1290.siteground.biz',
    user     : 'u6cdiqq87smud',
    password : 'dxxiri7kbhmb',
    // database : 'dbqpujqwr6gsfc',
    database : 'dbbbgmunthoxe8',
    port:'3306',
    multipleStatements: true 
               
       
  //   //siteground not working
  // host: '35.212.2.98',
  // user: 'u6cdiqq87smud',
  // password: 'dxxiri7kbhmb',
  // database: 'dbqpujqwr6gsfc',
  // port: '3306',
  // multipleStatements: true





  });
  

  mysqlConnection.connect((err)=>{
      if(!err){
        console.log("Database Connection Successful");
      }
      else{
        console.log("Connection Failure"+err);
      }
  });


  module.exports = mysqlConnection;

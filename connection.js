
//MySql COnnection
const mysql = require('mysql');
// const mysqlConnection = mysql.createConnection({ 
//createPool is used to avoid 505 err in render.com and also make app faster
 const mysqlConnection = mysql.createPool({//.createConnection({ //2024: new pool connection https://www.youtube.com/watch?v=eIjbSH3Imb8

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



  // host: 'mysqlcluster27.registeredsite.com',
  // user: 'ishahid_demo',
  // password: 'Is#kse494',
  // database: 'ksep_demo',
  // multipleStatements: true,
  // connectionLimit: 10,
  // // pool: { min: 0, max: 7 } // to avoid 505 err in render.com



  // host     : 'pmakf9two5d.registeredsite.com',
  // user     : 'ishahidnode2',
  // password : 'Is#kse494',
  // database : 'aep2',
  // multipleStatements: true 


  // Siteground compulink account
  // // host   : '35.212.2.98',//
  // siteground working with allowing remote access for 202.125.75.202 in siteground website
  // host     :'35.212.2.98',//'gvam1290.siteground.biz',
  // host: '35.212.92.202',//'gvam1261.siteground.biz',
  host: '35.212.92.202',//'gvam1261.siteground.biz',
  user     : 'u83v3o6dxmnkh',
  password : '$^##22#c)d5i',
  // database : 'dbqpujqwr6gsfc',
  database : 'db5hfh5k9wmqaz',
  port:'3306',
  multipleStatements: true ,
  connectionLimit: 10
   

  // // host   : '35.212.2.98',//
  // // siteground working with allowing remote access for 202.125.75.202 in siteground website
  // host     :'35.212.2.98',//'gvam1290.siteground.biz',
  // // host: '35.212.92.202',
  // user     : 'u6cdiqq87smud',
  // password : 'dxxiri7kbhmb',
  // // database : 'dbqpujqwr6gsfc',
  // database : 'dbbbgmunthoxe8',
  // port:'3306',
  // multipleStatements: true,
  // connectionLimit: 10





  //   //siteground not working
  // host: '35.212.2.98',
  // user: 'u6cdiqq87smud',
  // password: 'dxxiri7kbhmb',
  // database: 'dbqpujqwr6gsfc',
  // port: '3306',
  // multipleStatements: true





});


// mysqlConnection.connect((err)=>{
//     if(!err){
//       console.log("Database Connection Successful");
//     }
//     else{
//       console.log("Connection Failure"+err);
//     }
// });



// // Check pool connection
// mysqlConnection.query("SELECT EmpID FROM  emp_main", (err, result) => {
//   if (err) {
//     console.log("Connection Failure" + err)
//   }
//   console.log("Database Connection Successful");
// });



module.exports = mysqlConnection;

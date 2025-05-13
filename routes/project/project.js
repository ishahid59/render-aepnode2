const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const mysql = require('mysql');
const utils = require('../utils');
// authenticateToken can be used locally(on each function) or globally in server for all mod
// const authenticateToken= require('../middleware/authenticateToken');




// for project detail page combo
// Router.get('/all',authenticateToken,  function (req, res) {// with local auth
Router.get('/all',  function (req, res) {
  // let sql="SELECT pro_main.ProjectID, pro_main.ProjectName from pro_main WHERE pro_main.ProjectID>0 order by pro_main.ProjectID"
//   let sql= "SELECT ProjectID,ProjectNo,ProjectName FROM pro_main WHERE pro_main.ProjectID>-1 ORDER BY pro_main.ProjectNo"
  //2025
// let sql= "SELECT ProjectID,ProjectNo,ProjectName FROM pro_main WHERE pro_main.ProjectID>0 ORDER BY pro_main.ProjectNo"
let sql= "select CONCAT(pro_main.ProjectNo,' : ', pro_main.ProjectName) AS ProjectName, pro_main.ProjectID FROM  pro_main  where pro_main.ProjectID>0 order by ProjectNo"


    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});






// Used To Goto newly added Record in Empdetail used in EmpEditmodal/addEmp()
Router.get('/maxprojectid', function (req, res) {
    // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
    mysqlConnection.query("SELECT MAX(ProjectID) as maxprojectid FROM  pro_main", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
        // res.send(result[0].empid);
    });
});




 // Used To Goto newly added Record in Empdetail used in EmpEditmodal/addEmp()
Router.get('/lastprojectno', function (req, res) {
    // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
    mysqlConnection.query("SELECT MAX(ProjectNo) as lastprojectno FROM  pro_main", (err, result) => {
        if (err) {
            console.log(err)
        }
        // console.log("LASTPROJECTNO"+result);
        res.send(result);
        // res.send(result[0].empid);
    });
}); 



// // Used To check for duplicateemployeeid()
// Router.get('/duplicateprojectno/:projectno', function (req, res) {
//     // console.log("from maxempid"); 
//     // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
//     // mysqlConnection.query("SELECT *  FROM  emp_main", (err, result) => {
//     // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmployeeID=?", req.param('empid'), (err, rows) => {
//         // SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total
//         mysqlConnection.query("SELECT COUNT(*) AS projectnocount FROM pro_main  WHERE pro_main.ProjectNo=?", req.param('projectno'), (err, rows) => {
   
//         if (err) {
//             console.log(err)
//         }
//         res.send(rows);//note: cannot get result[0].employeeidcount here. But can get value in angular from 'rows'
//         // res.send(result[0].empid);
//         // console.log("from maxempid"); 
//     });

// });



// 2025 now checking all characters after 5 digits of  project no now since year may be different 
// Used To check for duplicateemployeeid()
Router.get('/duplicateprojectno/:projectno', function (req, res) {
    // console.log("from maxempid"); 
    // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT *  FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmployeeID=?", req.param('empid'), (err, rows) => {
        // SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total
        // mysqlConnection.query("SELECT COUNT(*) AS projectnocount FROM pro_main  WHERE pro_main.ProjectNo=?", req.param('projectno'), (err, rows) => {
        // mysqlConnection.query("SELECT COUNT(*) AS projectnocount FROM pro_main WHERE CAST(SUBSTRING(ProjectNo, 6) AS unsigned)=?", req.param('projectno'), (err, rows) => {
            mysqlConnection.query("SELECT COUNT(*) AS projectnocount FROM pro_main WHERE SUBSTRING(ProjectNo, 6)=?", req.param('projectno'), (err, rows) => {

       
            if (err) {
            console.log(err)
        }
        res.send(rows);//note: cannot get result[0].employeeidcount here. But can get value in angular from 'rows'
        // res.send(result[0].empid);
        // console.log("from maxempid"); 
        // console.log("COUNT"+ rows[0].projectnocount);
    });

});






// EDIT GET
Router.get('/:projectid', function (req, res) {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
   

    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmpID=?", req.param('empid'), (err, rows, fields) => {
         mysqlConnection.query("SELECT * FROM pro_main WHERE pro_main.ProjectID=?", req.param('projectid'), (err, rows, fields) => {
        //mysqlConnection.query("SELECT * FROM pro_main WHERE pro_main.ProjectID=?", req.params.projectid, (err, rows, fields) => {

//    console.log (req.param('empid'));    
        if (!err) {
            res.send(rows[0]);
            console.log(rows[0]);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});
 



// INSERT
// Router.post('/', function (req, res) {
    // With express-Validator   
    Router.post('/',[ 
        check('projectname', "projectname cannot be empty.").notEmpty(),
        check('projectno', "projectno cannot be empty.").notEmpty(),//.isEmail().withMessage('Firstname TEST must contain a number')
        check('awardyear', "awardyear cannot be empty.").notEmpty()
        ], 
        async function (req, res) {
           
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

    // console.log(req.body);
    // return
    // console.log(req.body.hiredate);
    
    var maxid = 0;
    // when query result from a function is called  it doesnt return a value.  So promise is used
    // we needed async function for execution sequence, and async function returns promise not any plain value. so Promise is used
    // await utils.maxid("SELECT COUNT(ID) AS total FROM emp_registration WHERE emp_registration.EmpID="+ req.body.empid)
    await utils.maxid("pro_main","ProjectID")
    .then(data => {
        maxid = data;
    });


    req.body.projectid = maxid + 1;
    let postdata = req.body; 

    // if(req.body.hiredate==null){
    //     req.body.hiredate="0000-00-00";
    // }



    // Create EmployeeID
    //******************************* */
    // let fname = (req.body.firstname).charAt(0);
    // req.body.employeeid=req.body.lastname +fname+req.body.middlei; // added 2023

    console.log("test9 "+req.body.empid);

    //  // Calculte maxid   
    //  //************************** */
    // var  maxid;
    // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
    //     if (err) {
    //         console.log(err)
    //     }
    //     res.send(result);
    //     // console.log(result[0].empid);
    //     // var maxid;
    //     maxid = result[0].empid;
    //     // console.log("test8  "+maxid);
    //     // req.body.empid = maxid+1;  
    // });
    // // return;  
    // req.body.empid = maxid+1; 
    // // req.body.empid = result[0].empid + 1;  
   
    // //  req.body.empid = 114;  //FOR TEST 


    mysqlConnection.query('INSERT INTO pro_main SET ?', postdata, function (error, results, fields) {
        if (!error) {
            console.log("success");
            res.send(results);
        } else {
            console.log(error);
        }
    });

});








// DELETE
Router.delete('/:projectid', function (req, res) {

    mysqlConnection.query("DELETE FROM pro_main WHERE ProjectID=?", req.param('projectid'), (err, rows, fields) => {
  
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});






// UPDATE
Router.post('/update', [
    check('projectname', "projectname cannot be empty.").notEmpty(),
    check('projectno', "projectno cannot be empty.").notEmpty(),//.isEmail().withMessage('Firstname TEST must contain a number')
    check('awardyear', "awardyear cannot be empty.").notEmpty()
],
    function (req, res) {
        // console.log("test3 "+req.body.employeeid);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }




        // //Consulant Checked send 1, but unchecked sends null so be manually put in 0
        // // if (req.body.consultant == null) {
        // //     req.body.consultant = 0;
        // // }
        // if (req.body.employee_consultant == null) {
        //     req.body.employee_consultant = 0;
        // }

        console.log("test33 "+req.body.secondaryprojecttype);
        // console.log("test3 "+req.body.employeeid);
        let post3 = req.body;

        // let query = `UPDATE emp_main  SET ? WHERE empid=?`;
        let query = `UPDATE pro_main  SET ? WHERE ProjectID=?`;
        mysqlConnection.query(query, [post3, req.body.projectid], (err, rows, fields) => {
            if (!err) {
                res.send(rows);
                console.log(post3);
            } else {
                console.log("err");
            }
        });
    });






// 20231114 Corected for Migrated(mssql to mysql) database using for search
// DETAIL PAGE used in ANGULAR 2022 to get jobtitle name instead of id
Router.get('/projectdetails/:projectid', function (req, res) {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
    mysqlConnection.query(

    //     `SELECT emp_main.EmpID,emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, list_empjobtitle.Str1 AS jobtitle, \
    //     list_empregistration.Str1 AS registration, emp_main.Employee_Consultant, emp_main.HireDate  \
    //      FROM emp_main INNER JOIN list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID \
    //     INNER JOIN list_empregistration on emp_main.Registration=list_empregistration.ListID WHERE emp_main.EmpID=?`
    // ,

    // `SELECT DISTINCT pro_main.ProjectName, list_proprole.Str1 AS ProjectRole, pro_main.AwardYear, pro_main.ProjectNo, list_proocategory.Str1 AS OwnerCategory, 
    // com_main.CompanyName AS ComID, list_projecttype.Str1 AS PrimaryProjectType, pro_main.SecondaryProjectType, cao_main.Name AS Owner, 
    // cao_main_1.Name AS Client, pro_main.ProjectAgreementNo, emp_main.EmployeeID AS ProjectManager, list_prostatus.Str1 AS ProjectStatus, 
    // proposal_main.ProposalNo AS ProposalID, pro_main.ProjectID
    // FROM  pro_main LEFT OUTER JOIN
    // list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
    // list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
    // list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
    // list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
    // proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
    // cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
    // cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
    // com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
    // emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
    // pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
    // pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
    // WHERE pro_main.ProjectID=?`


    `SELECT pro_main.ProjectName, list_proprole.Str1 AS disProjectRole, pro_main.AwardYear, pro_main.ProjectNo, list_proocategory.Str1 AS disOwnerCategory, 
    com_main.CompanyName AS disComID, list_projecttype.Str1 AS disPrimaryProjectType, pro_main.SecondaryProjectType, cao_main.Name AS disOwner, 
    cao_main_1.Name AS disClient, pro_main.ProjectAgreementNo, emp_main.EmployeeID AS disProjectManager, list_prostatus.Str1 AS disProjectStatus, 
    proposal_main.ProposalNo AS disProposalID, pro_main.ProjectRole, pro_main.OwnerCategory, pro_main.ComID, pro_main.PrimaryProjectType, pro_main.Owner, 
    pro_main.Client, pro_main.ProjectManager, pro_main.ProjectStatus, pro_main.ProposalID, pro_main.ProjectID
    FROM  pro_main LEFT OUTER JOIN
    list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
    list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
    list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
    list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
    proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
    cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
    cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
    com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
    emp_main ON pro_main.ProjectManager = emp_main.EmpID
    WHERE pro_main.ProjectID=?`

    ,

     req.param('projectid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});






// // 2023 Project angular datatable with Mysql
// // Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/angular-datatable', async function (req, res) {


//     let draw = req.body.draw;
//     let limit = req.body.length;
//     let offset = req.body.start;
//     // let ordercol = req.body['order[0][column]'];
//     let ordercol = req.body.order[0].column;//changed 20221130 for angular
//     // let orderdir =  req.body['order[0][dir]'];
//     let orderdir = req.body.order[0].dir;//changed 20221130 for angular
//     let search = req.body.search.value;
//     // let search = req.body['search[value]'];

//     var columns = {
//         0: 'ProjectID',
//         1: 'ProjectNo',
//         2: 'ProjectName',
//         3: 'ProjectRole',
//         4: 'AwardYear',
//         5: 'ProjectManager',
//         6: 'OwnerCategory',
//         7: 'ComID',
//         8: 'PrimaryProjectType',
//         9: 'SecondaryProjectType',
//         10: 'Owner',
//         11: 'Client',
//         12: 'ProjectAgreementNo',
//         13: 'ProjectStatus',
//         14: 'ProposalID',


//         // 0: 'ProjectNo',
//         // 1: 'ProjectName',
//         // 2: 'AwardYear',
//         // 3: 'PrimaryProjectType',
//         // 4: 'Owner',

//     }

//     var totalData = 0;
//     var totalbeforefilter = 0;
//     var totalFiltered = 0;
//     var col = columns[ordercol];// to get name of order col not index

//     // // For Getting the TotalData without Filter
//     // let sql1 = `SELECT * FROM pro_main WHERE pro_main.ProjectID>0`;
//     // mysqlConnection.query(sql1, (err, rows, fields) => {
//     //     totalData = rows.length;
//     //     // console.log("totalData2 :: " + rows.length);
//     //     // totalbeforefilter = rows.length; // disabled 2023
//     // });
//     // ** After using pool conn the mysql order has changed. So to keep the order async await is used
//     // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
//     // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

//     // await test().then(json => {console.log(json)});
//     // await utils.totaldata("SELECT * FROM pro_main WHERE pro_main.ProjectID>0").then(data => { totalData = data; });
//     // await utils.totaldata("SELECT COUNT(ProjectID) AS total FROM pro_main WHERE pro_main.ProjectID>0").then(data => {totalData = data;});
//     // const value = await totaldata();

//     let sql =
//         //**Note: LINE   "cao_main AS cao_main_1 ON pro_main.Client = cao_main.CAOID LEFT OUTER JOIN "
//         // is changed to "cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN "
//         `SELECT DISTINCT pro_main.ProjectName, list_proprole.Str1 AS ProjectRole, pro_main.AwardYear, pro_main.ProjectNo, list_proocategory.Str1 AS OwnerCategory, 
//         com_main.CompanyName AS ComID, list_projecttype.Str1 AS PrimaryProjectType, pro_main.SecondaryProjectType, cao_main.Name AS Owner, 
//         cao_main_1.Name AS Client, pro_main.ProjectAgreementNo, emp_main.EmployeeID AS ProjectManager, list_prostatus.Str1 AS ProjectStatus, 
//         proposal_main.ProposalNo AS ProposalID, pro_main.ProjectID,
//         (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata
//         FROM  pro_main LEFT OUTER JOIN
//         list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
//         list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
//         list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
//         list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
//         proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
//         cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
//         cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
//         com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
//         emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
//         pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
//         pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
//         WHERE (pro_main.ProjectID > 0)`

//     if (search == "") {
//         // console.log("No Search");
//         // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

//         // 2024 edited for showing all records
//         if (limit==-1) {
//             sql = sql + ` order by ${col} ${orderdir} `;
//         } else {
//             sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//         }
//         // sql = sql + ` order by ${col} ${orderdir} `;

//         // console.log(sql);
//         // console.log("sql print :: " + sql);
//         mysqlConnection.query(sql, (err, rows, fields) => {

//             if (!err) {
//                 //2024
//                 if (rows.length>0) {
//                     totalData = rows[0].totaldata;
//                 }
//                 totalFiltered = totalData;

//                 res.json({
//                     "draw": draw,
//                     "recordsTotal": totalData,
//                     "recordsFiltered": totalFiltered,
//                     "data": rows
//                 });
//             }
//             else {
//                 console.log(err);
//             }
//         });

//     } else {

//         sql = sql + ` AND pro_main.ProjectNo LIKE '%${search}%'`;
//         sql = sql + ` OR pro_main.ProjectName LIKE '%${search}%'`;
//         sql = sql + ` OR list_projecttype.Str1 LIKE '%${search}%'`;
//         sql = sql + ` OR pro_main.AwardYear LIKE '%${search}%'`;
//         sql = sql + ` OR cao_main.Name LIKE '%${search}%'`;

//     // //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
//     // So total filtered record is calculated before applying limit and
//     let totalbeforelimitandoffset = 0;
//     let sql3 = sql + ` order by ${col} ${orderdir} `;
//     // mysqlConnection.query(sql3, (err, rows3, fields) => {
//     //     totalbeforelimitandoffset = rows3.length;
//     //     // console.log("testtotal :: " + sql3);
//     // });

//     // ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
//     // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
//     // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
//     await utils.totalbeforelimtandoff(sql3).then(data => {totalbeforelimitandoffset = data;});


//     // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//     // 2024 edited for showing all records
//     if (limit==-1) {
//         sql = sql + ` order by ${col} ${orderdir} `;
//     } else {
//         sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//     }
//         mysqlConnection.query(sql, (err, rows2, fields) => {
//             if (!err) {
//                 //2024
//                 if (rows2.length>0) {
//                     totalData = rows2[0].totaldata;
//                 }
//                 totalFiltered = totalbeforelimitandoffset
//                 res.json({
//                     "draw": draw,
//                     "recordsTotal": totalData,
//                     "recordsFiltered": totalFiltered,
//                     "data": rows2
//                 });
//             }
//             else {
//                 console.log(err);
//             }
//         });

//     } // end else

// });






// 2024 USING THIS FOR ANGULAR DATATABLE 2024(count records used in one query for speed)
// https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
Router.post('/angular-datatable', async function (req, res) {


    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    // let ordercol = req.body['order[0][column]'];
    let ordercol = req.body.order[0].column;//changed 20221130 for angular
    // let orderdir =  req.body['order[0][dir]'];
    let orderdir = req.body.order[0].dir;//changed 20221130 for angular
    let search = req.body.search.value;
    // let search = req.body['search[value]'];


    
    //** This is needed for order by to work and exact field name should be used
    var columns = {
        0: 'ProjectID',
        1: 'ProjectNo',
        2: 'ProjectName',
        3: 'ProjectRole',
        4: 'AwardYear',
        5: 'ProjectManager',
        6: 'OwnerCategory',
        7: 'ComID',
        8: 'PrimaryProjectType',
        9: 'SecondaryProjectType',
        10: 'Owner',
        11: 'Client',
        12: 'ProjectAgreementNo',
        13: 'ProjectStatus',
        14: 'ProposalID',


        // 0: 'ProjectNo',
        // 1: 'ProjectName',
        // 2: 'AwardYear',
        // 3: 'PrimaryProjectType',
        // 4: 'Owner',

    }

    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index

    // // For Getting the TotalData without Filter
    // let sql1 = `SELECT * FROM pro_main WHERE pro_main.ProjectID>0`;
    // mysqlConnection.query(sql1, (err, rows, fields) => {
    //     totalData = rows.length;
    //     // console.log("totalData2 :: " + rows.length);
    //     // totalbeforefilter = rows.length; // disabled 2023
    // });
    // ** After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

    // await test().then(json => {console.log(json)});
    // await utils.totaldata("SELECT * FROM pro_main WHERE pro_main.ProjectID>0").then(data => { totalData = data; });
    // await utils.totaldata("SELECT COUNT(ProjectID) AS total FROM pro_main WHERE pro_main.ProjectID>0").then(data => {totalData = data;});
    // const value = await totaldata();

        // 2024 Avoid using multiple sql for speed
        // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
        // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
        // https://stackoverflow.com/questions/15710930/mysql-select-distinct-count
        
        var sqlWhere = '';
        let from = ` FROM pro_main LEFT OUTER JOIN
        list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
        list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
        list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
        list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
        proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
        cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
        cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
        com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
        emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
        pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
        pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
        WHERE (pro_main.ProjectID > 0) `


        //**Note: LINE   "cao_main AS cao_main_1 ON pro_main.Client = cao_main.CAOID LEFT OUTER JOIN "
        // is changed to "cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN "
        // 2024 https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
        // 2024 https://stackoverflow.com/questions/15710930/mysql-select-distinct-count

        let sql =
        `SELECT DISTINCT pro_main.ProjectName, list_proprole.Str1 AS ProjectRole, pro_main.AwardYear, pro_main.ProjectNo, list_proocategory.Str1 AS OwnerCategory, 
        com_main.CompanyName AS ComID, list_projecttype.Str1 AS PrimaryProjectType, pro_main.SecondaryProjectType, cao_main.Name AS Owner, 
        cao_main_1.Name AS Client, pro_main.ProjectAgreementNo, emp_main.EmployeeID AS ProjectManager, list_prostatus.Str1 AS ProjectStatus, 
        proposal_main.ProposalNo AS ProposalID, pro_main.ProjectID,
        (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata,
        (select count(DISTINCT pro_main.ProjectID) ${from} ${sqlWhere}) as totalfiltered 
        FROM pro_main LEFT OUTER JOIN
        list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
        list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
        list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
        list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
        proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
        cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
        cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
        com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
        emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
        pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
        pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
        WHERE (pro_main.ProjectID > 0)`




    if (search == "") {
        // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

        // 2024 edited for showing all records
        if (limit==-1) {
            sql = sql + ` order by ${col} ${orderdir} `;
        } else {
            sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        }
        // sql = sql + ` order by ${col} ${orderdir} `;
        mysqlConnection.query(sql, (err, rows, fields) => {

            if (!err) {
                //2024
                if (rows.length > 0) {
                    totalData = rows[0].totaldata;
                    totalFiltered = rows[0].totalfiltered;
                }

                res.json({
                    "draw": draw,
                    "recordsTotal": totalData,
                    "recordsFiltered": totalFiltered,
                    "data": rows
                });
            }
            else {
                console.log(err);
            }
        });

    } else {

        sqlWhere = sqlWhere + ` AND pro_main.ProjectNo LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR pro_main.ProjectName LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_proprole.Str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR pro_main.AwardYear LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR emp_main.EmployeeID LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_proocategory.Str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR com_main.CompanyName LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_projecttype.Str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR pro_main.SecondaryProjectType LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR cao_main.Name LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR cao_main_1.Name LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR pro_main.ProjectAgreementNo LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_prostatus.Str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR pro_main.ProposalID LIKE '%${search}%'`;



        sql =
        `SELECT DISTINCT pro_main.ProjectName, list_proprole.Str1 AS ProjectRole, pro_main.AwardYear, pro_main.ProjectNo, list_proocategory.Str1 AS OwnerCategory, 
        com_main.CompanyName AS ComID, list_projecttype.Str1 AS PrimaryProjectType, pro_main.SecondaryProjectType, cao_main.Name AS Owner, 
        cao_main_1.Name AS Client, pro_main.ProjectAgreementNo, emp_main.EmployeeID AS ProjectManager, list_prostatus.Str1 AS ProjectStatus, 
        proposal_main.ProposalNo AS ProposalID, pro_main.ProjectID,
        (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata,
        (select count(DISTINCT pro_main.ProjectID) ${from} ${sqlWhere}) as totalfiltered 
        FROM pro_main LEFT OUTER JOIN
        list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
        list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
        list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
        list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
        proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
        cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
        cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
        com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
        emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
        pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
        pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
        WHERE (pro_main.ProjectID > 0)`




    // //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
    // So total filtered record is calculated before applying limit and
    // let totalbeforelimitandoffset = 0;
    // let sql3 = sql + ` order by ${col} ${orderdir} `;
    // mysqlConnection.query(sql3, (err, rows3, fields) => {
    //     totalbeforelimitandoffset = rows3.length;
    //     // console.log("testtotal :: " + sql3);
    // });

    // ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
    // await utils.totalbeforelimtandoff(sql3).then(data => {totalbeforelimitandoffset = data;});


    // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
    // 2024 edited for showing all records
    if (limit==-1) {
        sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
    } else {
        sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
    }
        mysqlConnection.query(sql, (err, rows, fields) => {
            if (!err) {

                // totalFiltered = totalbeforelimitandoffset
                if (rows.length > 0) {
                    totalData = rows[0].totaldata;
                    totalFiltered = rows[0].totalfiltered;
                }
                res.json({
                    "draw": draw,
                    "recordsTotal": totalData,
                    "recordsFiltered": totalFiltered,
                    "data": rows
                });
            }
            else {
                console.log(err);
            }
        });

    } // end else

});














// 2023 Search Project with Mysql
// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/search/angular-datatable', async function (req, res) {

//     // console.log("TEST  "+ req.body.primaryprojecttype);
//     // console.log(req.body);
//     // return;
//     // console.log(req.body['search[value]']);
//     // return;


//     let draw = req.body.draw;
//     let limit = req.body.length;
//     let offset = req.body.start;
//     // let ordercol = req.body['order[0][column]'];
//     let ordercol = req.body.order[0].column;//changed 20221130 for angular
//     // let orderdir =  req.body['order[0][dir]'];
//     let orderdir = req.body.order[0].dir;//changed 20221130 for angular
//     let search = req.body.search.value;
//     // let search = req.body['search[value]'];

//     // let firstname=req.body.firstname;
//     // let lastname=req.body.lastname; 
//     // let jobtitle=req.body.jobtitle;
//     // let registration=req.body.registration;


//     let comid = req.body.comid;
//     // let primaryprojecttype = req.body.primaryprojecttype;
//     let primaryprojecttype = req.body.primaryprojecttype;
//     let projectrole = req.body.projectrole;
//     let ownercategory = req.body.ownercategory;
//     let owner = req.body.owner;
//     let client = req.body.client;
//     let projectstatus = req.body.projectstatus;
//     let empid = req.body.empid;
//     let empprojectrole = req.body.empprojectrole;
//     let firmfeeoperator = req.body.firmfeeoperator;
//     let firmfee = req.body.firmfee;
//     let constcostoperator = req.body.constcostoperator;
//     let constcost = req.body.constcost;
//     let expstartdateoperator = req.body.expstartdateoperator;
//     let expstartdate = req.body.expstartdate;
//     let expenddateoperator = req.body.expenddateoperator;
//     let expenddate = req.body.expenddate;
//     let excludeieprojects = req.body.excludeieprojects;
//     let excludeongoingprojects = req.body.excludeongoingprojects;

//     let secondaryprojecttype = req.body.secondaryprojecttype;


//     // to get the column name from index since dtable sends col index
//     // var columns = {
//     //     0: 'empid',
//     //     1: 'firstname',
//     //     2: 'lastname',
//     //     3: 'jobtitle',
//     //     4: 'registration',
//     //     // 5: 'hiredate',
//     //     5: 'empid',
//     // }

//     var columns = {
//         // 0: 'EmpID',
//         // // 1: 'EmployeeID',
//         // // 2: 'Firstname',
//         // // 3: 'Lastname',
//         // // 4: 'ComID',
//         // // 5: 'JobTitle',
//         // // 6: 'Department',
//         // // 7: 'Registration',
//         // // 8: 'HireDate',
//         // // 9: 'DisciplineSF254',
//         // // 10: 'DisciplineSF330',
//         // // 11: 'EmployeeStatus',
//         // // 12: 'ExpWithOtherFirm',
//         // // // 13 => 'Employee_Consultant',
//         // 0: 'EmployeeID',
//         // 1: 'JobTitle',
//         // 2: 'Registration',
//         // 3: 'HireDate',

//         0: 'chkbox',
//         1: 'ProjectID',//ProjectID is visible but display:none. needed for creating array for resume report
//         2: 'ProjectNo',
//         3: 'ProjectName',
//         4: 'ProjectRole',
//         5: 'AwardYear',
//         6: 'ProjectManager',
//         7: 'OwnerCategory',
//         8: 'ComID',
//         9: 'PrimaryProjectType',
//         10: 'SecondaryProjectType',
//         11: 'Owner',
//         12: 'Client',
//         13: 'ProjectAgreementNo',
//         14: 'ProjectStatus',
//         15: 'ProposalID',
//         16: 'Action',


//         // 0: 'chk',
//         // 1: 'ProjectID',
//         // 2: 'ProjectNo',
//         // 3: 'ProjectName',
//         // 4: 'ProjectRole',
//         // 5: 'AwardYear',
//         // 6: 'PrimaryrojectType',
//         // 7: 'Owner',
//         // 8: 'Action' 
     
   
//     }



//     var totalData = 0;
//     var totalbeforefilter = 0;
//     var totalFiltered = 0;
//     var col = columns[ordercol];// to get name of order col not index

//     // For Getting the TotalData without Filter
//     // let sql1 = `SELECT * FROM pro_main WHERE pro_main.ProjectID>0`;
//     // mysqlConnection.query(sql1, (err, rows, fields) => {
//     //     totalData = rows.length;
//     //     // console.log("totalData2 :: " +rows.length);
//     //     // totalbeforefilter = rows.length; // disabled 2023

//     // });

//     // ** After using pool conn the mysql order has changed. So to keep the order async await is used
//     // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
//     // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

//     // await test().then(json => {console.log(json)});
//     // await utils.totaldata("SELECT * FROM pro_main WHERE pro_main.ProjectID>0").then(data => { totalData = data; });
//     // await utils.totaldata("SELECT COUNT(ProjectID) AS total FROM pro_main WHERE pro_main.ProjectID>0").then(data => {totalData = data;});

//     // const value = await totaldata();


//     // console.log("LENGTH " +totalData);

//     // let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
//     // list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
//     // emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
//     // INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0`



//     let sql =
//         // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
//         //     list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
//         //     list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
//         //     emp_main.ExpWithOtherFirm
//         //     FROM emp_main LEFT OUTER JOIN
//         //     list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
//         //     list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
//         //     list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
//         //     list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
//         //     list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
//         //     list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
//         //     list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
//         //     list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
//         //     com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
//         //     emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
//         //     emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
//         //     pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
//         //     pro_main ON pro_team.ProjectID = pro_main.ProjectID
//         //     WHERE (emp_main.EmpID > 0)`


//         //**Note: LINE   "cao_main AS cao_main_1 ON pro_main.Client = cao_main.CAOID LEFT OUTER JOIN "
//         // is changed to "cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN "
//         //https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
//         `SELECT DISTINCT pro_main.ProjectName, list_proprole.Str1 AS ProjectRole, pro_main.AwardYear, pro_main.ProjectNo, list_proocategory.Str1 AS OwnerCategory, 
//         com_main.CompanyName AS ComID, list_projecttype.Str1 AS PrimaryProjectType, pro_main.SecondaryProjectType, cao_main.Name AS Owner, 
//         cao_main_1.Name AS Client, pro_main.ProjectAgreementNo, emp_main.EmployeeID AS ProjectManager, list_prostatus.Str1 AS ProjectStatus, 
//         proposal_main.ProposalNo AS ProposalID, pro_main.ProjectID,
//         (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata
//         FROM pro_main LEFT OUTER JOIN
//         list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
//         list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
//         list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
//         list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
//         proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
//         cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
//         cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
//         com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
//         emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
//         pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
//         pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
//         WHERE (pro_main.ProjectID > 0)`



//     let filterpresent = false;


//     if (comid > 0) {
//         sql = sql + ` AND com_main.ComID = ${comid}`
//         filterpresent = true;
//     }
//     if (primaryprojecttype > 0) {
//         sql = sql + ` AND pro_main.PrimaryProjectType = ${primaryprojecttype}`
//         filterpresent = true;
//     }




//     if (projectrole > 0) {
//         sql = sql + ` AND pro_main.ProjectRole = ${projectrole}`
//         filterpresent = true;
//     }
//     if (ownercategory > 0) {
//         sql = sql + ` AND pro_main.OwnerCategory = ${ownercategory}`
//         filterpresent = true;
//     }
//     if (owner > 0) {
//         sql = sql + ` AND pro_main.Owner = ${owner}`
//         filterpresent = true;
//     }
//     if (client > 0) {
//         sql = sql + ` AND pro_main.Client = ${client}`
//         filterpresent = true;
//     }
//     if (projectstatus > 0) {
//         sql = sql + ` AND pro_main.ProjectStatus = ${projectstatus}`
//         filterpresent = true;
//     }
//     // Multitable table
//     if (empid > 0) {
//         sql = sql + ` AND pro_team.EmpID = ${empid}`
//         filterpresent = true;
//     }
//     if (empprojectrole > 0) {
//         sql = sql + ` AND pro_team.EmpProjectRole = ${empprojectrole}`
//         filterpresent = true;
//     }


//     // Chk boxes
//     if (excludeieprojects > 0) {
//         projectrole = excludeieprojects
//         sql = sql + ` AND pro_main.ProjectRole != 4`
//         filterpresent = true;
//     }
//     // if (excludeongoingprojects > 0) {
//     //     projectrole=excludeongoingprojects
//     //     sql = sql + ` AND pro_datesandcosts.ActualCompletionDate != null`
//     //     sql = sql + ` AND pro_datesandcosts.ActualCompletionDate <> 0`
//     //     filterpresent = true;
//     // }  
//     // Checked 2023 working when NULL is in the field value
//     if (excludeongoingprojects > 0) {
//         projectrole = excludeongoingprojects
//         sql = sql + ` AND pro_datesandcosts.ActualCompletionDate IS NOT NULL`
//         // sql = sql + ` AND pro_datesandcosts.ActualCompletionDate <> 0`
//         filterpresent = true;
//     }


//     // Fee and cost
//     if (firmfeeoperator != "") {
//         let operator = firmfeeoperator
//         let amount = firmfee * 1000
//         // sql = sql + ` AND Pro_DatesAndCosts.FirmFee${operator}${amount}`
//         // sql = sql + ` AND Pro_DatesAndCosts.FirmFee${operator}${amount}`
//         sql = sql + ` AND pro_datesandcosts.FirmFee${operator}${amount}`
//         filterpresent = true;
//     }
//     if (constcostoperator != "") {
//         let operator = constcostoperator
//         // let amount=con * 1000
//         let amount = constcost * 1000
//         sql = sql + ` AND pro_datesandcosts.ConstructionCost${operator}${amount}`
//         filterpresent = true;
//     }
//     //2023

//     // duration dates from pro_team
//     if (expstartdateoperator != "") {
//         let operator = expstartdateoperator
//         let date = expstartdate
//         //2023 have to use '' for date in order to compare date in mysql
//         // sql = sql + ` AND pro_team.DurationFrom${operator}${date}`
//         sql = sql + ` AND pro_team.DurationFrom${operator}'${date}'`
//         filterpresent = true;
//     }
//     if (expenddateoperator != "") {
//         let operator = expenddateoperator
//         let date = expenddate
//         //2023 have to use '' for date in order to compare date in mysql
//         // sql = sql + ` AND pro_team.DurationFrom${operator}${date}`
//         sql = sql + ` AND pro_team.DurationFrom${operator}'${date}'`
//         filterpresent = true;
//     }


//     // if (count($request->secondaryprojecttype) > 0){
//     //     $total= count($request->secondaryprojecttype); 
//     //     $i=0;
//     //     for ($i=0; $i < $total ; $i++) { 
//     //       if ($i==0) {
//     //         $query=$query->where('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
//     //       }
//     //       else{
//     //         $query=$query->orWhere('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
//     //         // May have to use where instead of orwhere
//     //         // $query=$query->Where('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
//     //       }
//     //     }
//     //   }


//     //     // if (count(secondaryprojecttype) > 0) {
//     //     //     $total = count(secondaryprojecttype);
//     //     if (secondaryprojecttype.length > 0) {
//     //         $total = secondaryprojecttype.length;
//     //         $i = 0;
//     //         for ($i = 0; $i < $total; $i++) {
//     //             if ($i == 0) {
//     //                 // $query = $query -> where('pro_main.SecondaryProjectType', 'like', $request -> secondaryprojecttype[$i]);
//     //                 // sql = sql + ` AND pro_main.SecondaryProjectType like  ${secondaryprojecttype[$i]}`;
//     //                 sql = sql + ` AND pro_main.SecondaryProjectType like  ${secondaryprojecttype[$i]}`;
//     //             }
//     //             else {
//     //                 // $query = $query -> orWhere('pro_main.SecondaryProjectType', 'like', $request -> secondaryprojecttype[$i]);
//     //                 sql = sql + ` OR pro_main.SecondaryProjectType like ${secondaryprojecttype[$i]}`;
//     //                 // May have to use where instead of orwhere
//     //                 // $query=$query->Where('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
//     //             }
//     //         }
//     //     }


//     // // Multi select cmb
//     // // 2023 Using simply IN clause instead of LIKE(LIKE clause not working) https://stackoverflow.com/questions/2674011/mysql-check-if-numbers-are-in-a-comma-separated-list 
//     // if (secondaryprojecttype != "") {
//     //     // sql = sql + ` AND ${secondaryprojecttype} IN (pro_main.SecondaryProjectType)`
//     //     sql = sql + ` AND FIND_IN_SET('${secondaryprojecttype}', pro_main.SecondaryProjectType)`
//     //     // AND FIND_IN_SET('25', SecondaryProjectType)
//     //     filterpresent = true;
//     // }



//     // https://stackoverflow.com/questions/2674011/mysql-check-if-numbers-are-in-a-comma-separated-list 
//     // if (secondaryprojecttype.length > 0) { // length is showing 1 even for empty array. so string comparison is used
//     if (secondaryprojecttype != "") {
//         $total = secondaryprojecttype.length;
//         $i = 0;
//         for ($i = 0; $i < $total; $i++) {
//             if ($i == 0) {
//                 // sql = sql + ` AND pro_main.SecondaryProjectType like  ${secondaryprojecttype[$i]}`;
//                 sql = sql + ` AND FIND_IN_SET('${secondaryprojecttype[$i]}', pro_main.SecondaryProjectType)`
//             }
//             else {
//                 // $query = $query -> orWhere('pro_main.SecondaryProjectType', 'like', $request -> secondaryprojecttype[$i]);
//                 sql = sql + ` OR FIND_IN_SET('${secondaryprojecttype[$i]}', pro_main.SecondaryProjectType)`
//             }
//         }
//         filterpresent = true;

//     }
//     // console.log("MYSQL   " + sql);


 


//     //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
//     // So total filtered record is calculated before applying limit and
//     let totalbeforelimitandoffset = 0;
//     let sql3 = sql + ` order by ${col} ${orderdir} `;
//     // mysqlConnection.query(sql3, (err, rows3, fields) => {
//     //     totalbeforelimitandoffset = rows3.length;
//     //     // console.log("testtotal :: " +sql3);
//     // });

//     // ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
//     // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
//     // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
//     await utils.totalbeforelimtandoff(sql3).then(data => {totalbeforelimitandoffset = data;});

//     // console.log("test  : " + sql);
//     // return
//     if (search == "") {
//         // console.log("No Search");

//         // 2024 edited for showing all records
//         if (limit==-1) {
//             sql = sql + ` order by ${col} ${orderdir} `;
//         } else {
//             sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//         }
        


//         // sql = sql + ` order by ${col} ${orderdir} limit ${242} offset ${0} `;
//         // sql = sql + ` order by ${col} ${orderdir} `;

//         // console.log(sql);
//         // console.log("sql print :: " +sql);
//         mysqlConnection.query(sql, (err, rows, fields) => {

//             // if (!err) {
//             //     totalFiltered = totalbeforefilter;
//             //     res.json({
//             //         "draw": draw,
//             //         "recordsTotal": totalData,
//             //         "recordsFiltered": totalFiltered,
//             //         "data": rows
//             //     });
//             // }
//             // else {
//             //     console.log(err);
//             // }

//             if (!err) {

//                 if (!filterpresent) {
//                     // totalFiltered = totalbeforefilter;
//                     //2023 important. if no filter is present totalFiltered remains totalData in table
//                     //2024
//                     if (rows.length>0) {
//                         totalData = rows[0].totaldata;
//                     }
//                     totalFiltered = totalData;
//                 }
//                 else {
//                     // totalFiltered = rows.length;
//                     //2023 important. if filter is present then get totalFiltered value totalbeforelimitandoffset
//                     // before limit and offset is applied to sql string
//                     //2024
//                     if (rows.length>0) {
//                         totalData = rows[0].totaldata;
//                     }
//                     totalFiltered = totalbeforelimitandoffset;

//                 }
//                 // console.log("======================================: ");
//                 // console.log("titaldata: "+totalData);
//                 // console.log("totalFiltered: "+totalFiltered);
//                 res.json({
//                     "draw": draw,
//                     "recordsTotal": totalData,
//                     "recordsFiltered": totalFiltered,
//                     "data": rows
//                 });
//             }
//             else {
//                 console.log(err);
//             }

//         });

//     } else {
//         // sql = sql + ` AND Firstname LIKE '%${search}%'`;
//         // sql = sql + ` OR Lastname LIKE '%${search}%'`;
//         // sql = sql + ` OR list_EmpJobTitle.str1 LIKE '%${search}%'`;
//         // sql = sql + ` OR list_EmpRegistration.str1 LIKE '%${search}%'`;

//         sql = sql + ` AND pro_main.ProjectNo LIKE '%${search}%'`;
//         sql = sql + ` OR pro_main.ProjectName LIKE '%${search}%'`;
//         sql = sql + ` OR list_projecttype.Str1 LIKE '%${search}%'`;
//         sql = sql + ` OR pro_main.AwardYear LIKE '%${search}%'`;
//         sql = sql + ` OR cao_main.Name LIKE '%${search}%'`;

//         await utils.totalbeforelimtandoff(sql).then(data => {totalbeforelimitandoffset = data;});

//         // 2024 edited for showing all records
//         if (limit==-1) {
//             sql = sql + ` order by ${col} ${orderdir} `;
//         } else {
//             sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//         }
        
//         mysqlConnection.query(sql, (err, rows, fields) => {
//             if (!err) {
//                 //2024
//                 if (rows.length>0) {
//                     totalData = rows[0].totaldata;
//                 }
//                 // totalFiltered = rows.length;
//                 totalFiltered = totalbeforelimitandoffset;//rows.length;

//                 console.log("totalFiltered "+totalFiltered);
//                 res.json({
//                     "draw": draw,
//                     "recordsTotal": totalData,
//                     "recordsFiltered": totalFiltered,
//                     "data": rows
//                 });
//             }
//             else {
//                 console.log(err);
//             }
//         });
//     } // end else

// });






// 2024 USING THIS (with count in same query for faster loading)
// https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
Router.post('/search/angular-datatable', async function (req, res) {

    // console.log("TEST  "+ req.body.primaryprojecttype);
    // console.log(req.body);
    // return;
    // console.log(req.body['search[value]']);
    // return;


    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    // let ordercol = req.body['order[0][column]'];
    let ordercol = req.body.order[0].column;//changed 20221130 for angular
    // let orderdir =  req.body['order[0][dir]'];
    let orderdir = req.body.order[0].dir;//changed 20221130 for angular
    let search = req.body.search.value;
    // let search = req.body['search[value]'];

    // let firstname=req.body.firstname;
    // let lastname=req.body.lastname; 
    // let jobtitle=req.body.jobtitle;
    // let registration=req.body.registration;


    let comid = req.body.comid;
    // let primaryprojecttype = req.body.primaryprojecttype;
    let primaryprojecttype = req.body.primaryprojecttype;
    let projectrole = req.body.projectrole;
    let ownercategory = req.body.ownercategory;
    let owner = req.body.owner;
    let client = req.body.client;
    let projectstatus = req.body.projectstatus;
    let empid = req.body.empid;
    let empprojectrole = req.body.empprojectrole;
    let firmfeeoperator = req.body.firmfeeoperator;
    let firmfee = req.body.firmfee;
    let constcostoperator = req.body.constcostoperator;
    let constcost = req.body.constcost;
    let expstartdateoperator = req.body.expstartdateoperator;
    let expstartdate = req.body.expstartdate;
    let expenddateoperator = req.body.expenddateoperator;
    let expenddate = req.body.expenddate;
    let excludeieprojects = req.body.excludeieprojects;
    let excludeongoingprojects = req.body.excludeongoingprojects;

    let secondaryprojecttype = req.body.secondaryprojecttype;


    // to get the column name from index since dtable sends col index
    // var columns = {
    //     0: 'empid',
    //     1: 'firstname',
    //     2: 'lastname',
    //     3: 'jobtitle',
    //     4: 'registration',
    //     // 5: 'hiredate',
    //     5: 'empid',
    // }

    var columns = {
        // 0: 'EmpID',
        // // 1: 'EmployeeID',
        // // 2: 'Firstname',
        // // 3: 'Lastname',
        // // 4: 'ComID',
        // // 5: 'JobTitle',
        // // 6: 'Department',
        // // 7: 'Registration',
        // // 8: 'HireDate',
        // // 9: 'DisciplineSF254',
        // // 10: 'DisciplineSF330',
        // // 11: 'EmployeeStatus',
        // // 12: 'ExpWithOtherFirm',
        // // // 13 => 'Employee_Consultant',
        // 0: 'EmployeeID',
        // 1: 'JobTitle',
        // 2: 'Registration',
        // 3: 'HireDate',

        0: 'chkbox',
        1: 'ProjectID',//ProjectID is visible but display:none. needed for creating array for resume report
        2: 'ProjectNo',
        3: 'ProjectName',
        4: 'ProjectRole',
        5: 'AwardYear',
        6: 'ProjectManager',
        7: 'OwnerCategory',
        8: 'ComID',
        9: 'PrimaryProjectType',
        10: 'SecondaryProjectType',
        11: 'Owner',
        12: 'Client',
        13: 'ProjectAgreementNo',
        14: 'ProjectStatus',
        15: 'ProposalID',
        16: 'Action',




        // 0: 'chk',
        // 1: 'ProjectID',
        // 2: 'ProjectNo',
        // 3: 'ProjectName',
        // 4: 'ProjectRole',
        // 5: 'AwardYear',
        // 6: 'PrimaryrojectType',
        // 7: 'Owner',
        // 8: 'Action' 
     
   
    }



    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index

    // For Getting the TotalData without Filter
    // let sql1 = `SELECT * FROM pro_main WHERE pro_main.ProjectID>0`;
    // mysqlConnection.query(sql1, (err, rows, fields) => {
    //     totalData = rows.length;
    //     // console.log("totalData2 :: " +rows.length);
    //     // totalbeforefilter = rows.length; // disabled 2023

    // });

    // ** After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

    // await test().then(json => {console.log(json)});
    // await utils.totaldata("SELECT * FROM pro_main WHERE pro_main.ProjectID>0").then(data => { totalData = data; });
    // await utils.totaldata("SELECT COUNT(ProjectID) AS total FROM pro_main WHERE pro_main.ProjectID>0").then(data => {totalData = data;});

    // const value = await totaldata();


    // console.log("LENGTH " +totalData);

    // let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
    // list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
    // emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
    // INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0`



    // let sql =
        // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
        //     list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
        //     list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
        //     emp_main.ExpWithOtherFirm
        //     FROM emp_main LEFT OUTER JOIN
        //     list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
        //     list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
        //     list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
        //     list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
        //     list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
        //     list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
        //     list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
        //     list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
        //     com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
        //     emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
        //     emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
        //     pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
        //     pro_main ON pro_team.ProjectID = pro_main.ProjectID
        //     WHERE (emp_main.EmpID > 0)`


    var sqlWhere = '';
    let filterpresent = false;


    if (comid > 0) {
        sqlWhere = sqlWhere + ` AND com_main.ComID = ${comid}`
        filterpresent = true;
    }
    if (primaryprojecttype > 0) {
        sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${primaryprojecttype}`
        filterpresent = true;
    }




    if (projectrole > 0) {
        sqlWhere = sqlWhere + ` AND pro_main.ProjectRole = ${projectrole}`
        filterpresent = true;
    }
    if (ownercategory > 0) {
        sqlWhere = sqlWhere + ` AND pro_main.OwnerCategory = ${ownercategory}`
        filterpresent = true;
    }
    if (owner > 0) {
        sqlWhere = sqlWhere + ` AND pro_main.Owner = ${owner}`
        filterpresent = true;
    }
    if (client > 0) {
        sqlWhere = sqlWhere + ` AND pro_main.Client = ${client}`
        filterpresent = true;
    }
    if (projectstatus > 0) {
        sqlWhere = sqlWhere + ` AND pro_main.ProjectStatus = ${projectstatus}`
        filterpresent = true;
    }
    // Multitable table
    if (empid > 0) {
        sqlWhere = sqlWhere + ` AND pro_team.EmpID = ${empid}`
        filterpresent = true;
    }
    if (empprojectrole > 0) {
        sqlWhere = sqlWhere + ` AND pro_team.EmpProjectRole = ${empprojectrole}`
        filterpresent = true;
    }


    // Chk boxes
    if (excludeieprojects > 0) {
        projectrole = excludeieprojects
        sqlWhere = sqlWhere + ` AND pro_main.ProjectRole != 4`
        filterpresent = true;
    }
    // if (excludeongoingprojects > 0) {
    //     projectrole=excludeongoingprojects
    //     sqlWhere = sqlWhere + ` AND pro_datesandcosts.ActualCompletionDate != null`
    //     sqlWhere = sqlWhere + ` AND pro_datesandcosts.ActualCompletionDate <> 0`
    //     filterpresent = true;
    // }  
    // Checked 2023 working when NULL is in the field value
    if (excludeongoingprojects > 0) {
        projectrole = excludeongoingprojects
        sqlWhere = sqlWhere + ` AND pro_datesandcosts.ActualCompletionDate IS NOT NULL`
        // sqlWhere = sqlWhere + ` AND pro_datesandcosts.ActualCompletionDate <> 0`
        filterpresent = true;
    }


    // Fee and cost
    if (firmfeeoperator != "") {
        let operator = firmfeeoperator
        let amount = firmfee * 1000
        // sqlWhere = sqlWhere + ` AND Pro_DatesAndCosts.FirmFee${operator}${amount}`
        // sqlWhere = sqlWhere + ` AND Pro_DatesAndCosts.FirmFee${operator}${amount}`
        sqlWhere = sqlWhere + ` AND pro_datesandcosts.FirmFee${operator}${amount}`
        filterpresent = true;
    }
    if (constcostoperator != "") {
        let operator = constcostoperator
        // let amount=con * 1000
        let amount = constcost * 1000
        sqlWhere = sqlWhere + ` AND pro_datesandcosts.ConstructionCost${operator}${amount}`
        filterpresent = true;
    }
    //2023

    // duration dates from pro_team
    if (expstartdateoperator != "") {
        let operator = expstartdateoperator
        let date = expstartdate
        //2023 have to use '' for date in order to compare date in mysqlWhere
        // sqlWhere = sqlWhere + ` AND pro_team.DurationFrom${operator}${date}`
        sqlWhere = sqlWhere + ` AND pro_team.DurationFrom${operator}'${date}'`
        filterpresent = true;
    }
    if (expenddateoperator != "") {
        let operator = expenddateoperator
        let date = expenddate
        //2023 have to use '' for date in order to compare date in mysqlWhere
        // sqlWhere = sqlWhere + ` AND pro_team.DurationFrom${operator}${date}`
        sqlWhere = sqlWhere + ` AND pro_team.DurationFrom${operator}'${date}'`
        filterpresent = true;
    }


    // if (count($request->secondaryprojecttype) > 0){
    //     $total= count($request->secondaryprojecttype); 
    //     $i=0;
    //     for ($i=0; $i < $total ; $i++) { 
    //       if ($i==0) {
    //         $query=$query->where('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
    //       }
    //       else{
    //         $query=$query->orWhere('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
    //         // May have to use where instead of orwhere
    //         // $query=$query->Where('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
    //       }
    //     }
    //   }


    //     // if (count(secondaryprojecttype) > 0) {
    //     //     $total = count(secondaryprojecttype);
    //     if (secondaryprojecttype.length > 0) {
    //         $total = secondaryprojecttype.length;
    //         $i = 0;
    //         for ($i = 0; $i < $total; $i++) {
    //             if ($i == 0) {
    //                 // $query = $query -> where('pro_main.SecondaryProjectType', 'like', $request -> secondaryprojecttype[$i]);
    //                 // sql = sql + ` AND pro_main.SecondaryProjectType like  ${secondaryprojecttype[$i]}`;
    //                 sql = sql + ` AND pro_main.SecondaryProjectType like  ${secondaryprojecttype[$i]}`;
    //             }
    //             else {
    //                 // $query = $query -> orWhere('pro_main.SecondaryProjectType', 'like', $request -> secondaryprojecttype[$i]);
    //                 sql = sql + ` OR pro_main.SecondaryProjectType like ${secondaryprojecttype[$i]}`;
    //                 // May have to use where instead of orwhere
    //                 // $query=$query->Where('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
    //             }
    //         }
    //     }


    // // Multi select cmb
    // // 2023 Using simply IN clause instead of LIKE(LIKE clause not working) https://stackoverflow.com/questions/2674011/mysql-check-if-numbers-are-in-a-comma-separated-list 
    // if (secondaryprojecttype != "") {
    //     // sql = sql + ` AND ${secondaryprojecttype} IN (pro_main.SecondaryProjectType)`
    //     sql = sql + ` AND FIND_IN_SET('${secondaryprojecttype}', pro_main.SecondaryProjectType)`
    //     // AND FIND_IN_SET('25', SecondaryProjectType)
    //     filterpresent = true;
    // }




    // // https://stackoverflow.com/questions/2674011/mysql-check-if-numbers-are-in-a-comma-separated-list 
    // // if (secondaryprojecttype.length > 0) { // length is showing 1 even for empty array. so string comparison is used
    // if (secondaryprojecttype != "") {
    //     $total = secondaryprojecttype.length;
    //     $i = 0;
    //     for ($i = 0; $i < $total; $i++) {
    //         if ($i == 0) {
    //             // sqlWhere = sqlWhere + ` AND pro_main.SecondaryProjectType like  ${secondaryprojecttype[$i]}`;
    //             sqlWhere = sqlWhere + ` AND FIND_IN_SET('${secondaryprojecttype[$i]}', pro_main.SecondaryProjectType)`
    //         }
    //         else {
    //             // $query = $query -> orWhere('pro_main.SecondaryProjectType', 'like', $request -> secondaryprojecttype[$i]);
    //             sqlWhere = sqlWhere + ` OR FIND_IN_SET('${secondaryprojecttype[$i]}', pro_main.SecondaryProjectType)`
    //         }
    //     }
    //     filterpresent = true;

    // }



    // 2024427 new "OR" clause should be enclosed with bracket() so that the "OR" clause is seperated from "AND"
    // eg: SELECT * FROM Customers WHERE Country = 'Germany' AND (City = 'Berlin' OR City = 'Stuttgart');

    // https://stackoverflow.com/questions/2674011/mysql-check-if-numbers-are-in-a-comma-separated-list 
    // if (secondaryprojecttype.length > 0) { // length is showing 1 even for empty array. so string comparison is used
    if (secondaryprojecttype != "") {
        $total = secondaryprojecttype.length;
        $i = 0;
        for ($i = 0; $i < $total; $i++) {
            if ($i == 0) {
                // sqlWhere = sqlWhere + ` AND pro_main.SecondaryProjectType like  ${secondaryprojecttype[$i]}`;
                sqlWhere = sqlWhere + ` AND (FIND_IN_SET('${secondaryprojecttype[$i]}', pro_main.SecondaryProjectType)`
            }
            else {
                // $query = $query -> orWhere('pro_main.SecondaryProjectType', 'like', $request -> secondaryprojecttype[$i]);
                sqlWhere = sqlWhere + ` OR FIND_IN_SET('${secondaryprojecttype[$i]}', pro_main.SecondaryProjectType)`
            }
        }
        sqlWhere = sqlWhere +`)`//FIND_IN_SET closing common bracket

        filterpresent = true;

    }

    console.log("testtota5 :: " +sqlWhere);



        // 2024 Avoid using multiple sql for speed
        // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
        
        let from = ` FROM pro_main LEFT OUTER JOIN
        list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
        list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
        list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
        list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
        proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
        cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
        cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
        com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
        emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
        pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
        pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
        WHERE (pro_main.ProjectID > 0) `


        //**Note: LINE   "cao_main AS cao_main_1 ON pro_main.Client = cao_main.CAOID LEFT OUTER JOIN "
        // is changed to "cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN "
        // 2024 https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
        // 2024 https://stackoverflow.com/questions/15710930/mysql-select-distinct-count

        let sql =
        `SELECT DISTINCT pro_main.ProjectName, list_proprole.Str1 AS ProjectRole, pro_main.AwardYear, pro_main.ProjectNo, list_proocategory.Str1 AS OwnerCategory, 
        com_main.CompanyName AS ComID, list_projecttype.Str1 AS PrimaryProjectType, pro_main.SecondaryProjectType, cao_main.Name AS Owner, 
        cao_main_1.Name AS Client, pro_main.ProjectAgreementNo, emp_main.EmployeeID AS ProjectManager, list_prostatus.Str1 AS ProjectStatus, 
        proposal_main.ProposalNo AS ProposalID, pro_main.ProjectID,
        (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata,
        (select count(DISTINCT pro_main.ProjectID) ${from} ${sqlWhere}) as totalfiltered 
        FROM pro_main LEFT OUTER JOIN
        list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
        list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
        list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
        list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
        proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
        cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
        cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
        com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
        emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
        pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
        pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
        WHERE (pro_main.ProjectID > 0)`



    
    //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
    // So total filtered record is calculated before applying limit and
    // let totalbeforelimitandoffset = 0;
    // let sql3 = sql + ` order by ${col} ${orderdir} `;
    // mysqlConnection.query(sql3, (err, rows3, fields) => {
    //     totalbeforelimitandoffset = rows3.length;
    //     // console.log("testtotal :: " +sql3);
    // });

    // ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
    // await utils.totalbeforelimtandoff(sql3).then(data => {totalbeforelimitandoffset = data;});



    if (search == "") {

        // 2024 edited for showing all records
        if (limit==-1) {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
        } else {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        }

        mysqlConnection.query(sql, (err, rows, fields) => {

            if (!err) {

                if (!filterpresent) {
                    // totalFiltered = totalbeforefilter;
                    //2023 important. if no filter is present totalFiltered remains totalData in table
                    //2024
                    if (rows.length>0) {
                        totalData = rows[0].totaldata;
                    }
                    totalFiltered = totalData;
                }
                else {
                    // totalFiltered = rows.length;
                    //2023 important. if filter is present then get totalFiltered value totalbeforelimitandoffset
                    // before limit and offset is applied to sql string
                    //2024
                    if (rows.length>0) {
                        totalData = rows[0].totaldata;
                    }
                    // totalFiltered = totalbeforelimitandoffset;
                    if (rows.length>0) {
                        totalFiltered = rows[0].totalfiltered;
                    }

                }
                res.json({
                    "draw": draw,
                    "recordsTotal": totalData,
                    "recordsFiltered": totalFiltered,
                    "data": rows
                });
            }
            else {
                console.log(err);
            }

        });

    } else {


        sqlWhere = sqlWhere + ` AND pro_main.ProjectNo LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR pro_main.ProjectName LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_proprole.Str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR pro_main.AwardYear LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR emp_main.EmployeeID LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_proocategory.Str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR com_main.CompanyName LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_projecttype.Str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR pro_main.SecondaryProjectType LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR cao_main.Name LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR cao_main_1.Name LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR pro_main.ProjectAgreementNo LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_prostatus.Str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR pro_main.ProposalID LIKE '%${search}%'`;

        // await utils.totalbeforelimtandoff(sql).then(data => {totalbeforelimitandoffset = data;});

        sql =
        `SELECT DISTINCT pro_main.ProjectName, list_proprole.Str1 AS ProjectRole, pro_main.AwardYear, pro_main.ProjectNo, list_proocategory.Str1 AS OwnerCategory, 
        com_main.CompanyName AS ComID, list_projecttype.Str1 AS PrimaryProjectType, pro_main.SecondaryProjectType, cao_main.Name AS Owner, 
        cao_main_1.Name AS Client, pro_main.ProjectAgreementNo, emp_main.EmployeeID AS ProjectManager, list_prostatus.Str1 AS ProjectStatus, 
        proposal_main.ProposalNo AS ProposalID, pro_main.ProjectID,
        (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata,
        (select count(DISTINCT pro_main.ProjectID) ${from} ${sqlWhere}) as totalfiltered 
        FROM pro_main LEFT OUTER JOIN
        list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
        list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
        list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
        list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
        proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
        cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
        cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
        com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
        emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
        pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
        pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
        WHERE (pro_main.ProjectID > 0)`



        // 2024 edited for showing all records
        if (limit==-1) {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
        } else {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        }
        
        mysqlConnection.query(sql, (err, rows, fields) => {
            if (!err) {
                // totalFiltered = rows.length;
                // totalFiltered = totalbeforelimitandoffset;//rows.length;
                if (rows.length>0) {
                    totalData = rows[0].totaldata;
                }
                if (rows.length>0) {
                    totalFiltered = rows[0].totalfiltered;
                }
                res.json({
                    "draw": draw,
                    "recordsTotal": totalData,
                    "recordsFiltered": totalFiltered,
                    "data": rows
                });
            }
            else {
                console.log(err);
            }
        });
    } // end else

});



    
module.exports = Router;


    
    
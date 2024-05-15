const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const mysql = require('mysql');
const utils = require('../utils');
// authenticateToken can be used locally(on each function) or globally in server for all mod
// const authenticateToken= require('../middleware/authenticateToken');



//************************************************************** */
// AUTHENTICATION FOR INDIVIDUAL ROUTES can be used
//************************************************************** */

// Router.use(authenticateToken); 



// Router.get('/all',authenticateToken,  function (req, res) {// with local auth
// Used To Goto newly added Record in Empdetail used in EmpEditmodal/addEmp()
Router.get('/maxempid', function (req, res) {
    // console.log("from maxempid"); 
    // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
    mysqlConnection.query("SELECT MAX(EmpID) as maxempid FROM  emp_main", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
        // res.send(result[0].empid);
    });
});




// Used To check for duplicateemployeeid()
Router.get('/duplicateemployeeid/:employeeid', function (req, res) {
    // console.log("from maxempid"); 
    // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT *  FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmployeeID=?", req.param('empid'), (err, rows) => {
        // SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total
        mysqlConnection.query("SELECT COUNT(*) AS employeeidcount FROM emp_main  WHERE emp_main.EmployeeID=?", req.param('employeeid'), (err, rows) => {
   
        if (err) {
            console.log(err)
        }
        res.send(rows);//note: cannot get result[0].employeeidcount here. But can get value in angular from 'rows'
        // res.send(result[0].empid);
        // console.log("from maxempid"); 
    });

});





// ALL TEST
// Router.get('/all',authenticateToken,  function (req, res) {// with local auth
Router.get('/all',  function (req, res) {
    // utils.test();
    // console.log(req.body)
    // let sql="SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
    //  list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
    //  emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
    //  INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0 order by emp_main.empid"
   
    // let sql="SELECT emp_main.EmpID, emp_main.EmployeeID from emp_main WHERE emp_main.EmpID>0 order by emp_main.EmpID"
    let sql="SELECT emp_main.EmpID, emp_main.EmployeeID from emp_main WHERE emp_main.EmpID>0 order by emp_main.EmployeeID"

     mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});




//  datatable severside code Working
// ***************************************************************************
Router.get('/', function (req, res) {



    let draw = req.query.draw;
    let limit = req.query.length;
    let offset = req.query.start;
    let ordercol = req.query.order[0].column;
    let orderdir = req.query.order[0].dir;
    let search = req.query.search.value;

    let firstname=req.query.firstname;
    let lastname=req.query.lastname; 
    let jobtitle=req.query.jobtitle;
    let registration=req.query.registration;

    // console.log(req.query.firstname)


    var columns = {
        0: 'empid',
        1: 'firstname',
        2: 'lastname',
        3: 'jobtitle',
        4: 'registration',
        5: 'hiredate',
    }

    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];

    //For Getting the TotalData without Filter
    let sql1 = `SELECT * FROM emp_main WHERE emp_main.empid>0`;
    mysqlConnection.query(sql1, (err, rows, fields) => {
        totalData = rows.length;
        totalbeforefilter = rows.length;
    });

    let data = 0;
    // For getting the DataTable
    // let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
    // list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
    // emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
    // INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0`

    let sql = `SELECT Emp_Main.EmployeeID, List_EmpPrefix.Str1 AS Prefix, List_EmpSuffix.Str1 AS Suffix, List_EmpJobTitle.Str1 AS JobTitle, List_DisciplineSF330.Str2 AS DisciplineSF330, \
    List_DisciplineSF254.Str1 AS DisciplineSF254, List_Department.Str1 AS Department, List_EmpRegistration.Str1 AS Registration, List_EmpStatus.Str1 AS EmployeeStatus, Emp_Main.HireDate, \
    Emp_Main.Lastname, Emp_Main.Firstname, Emp_Main.MiddleI, Emp_Main.Employee_Consultant, Emp_Main.ExpWithOtherFirm, Com_Main.CompanyName AS ComID, Emp_Main.FullName, \
    Emp_Main.EmpID \
    FROM     List_EmpSuffix INNER JOIN \
    Emp_Main INNER JOIN \
    Com_Main ON Emp_Main.ComID = Com_Main.ComID INNER JOIN \
    List_EmpPrefix ON Emp_Main.Prefix = List_EmpPrefix.ListID ON List_EmpSuffix.ListID = Emp_Main.Suffix INNER JOIN \
    List_EmpJobTitle ON Emp_Main.JobTitle = List_EmpJobTitle.ListID INNER JOIN \
    List_Department ON Emp_Main.Department = List_Department.ListID INNER JOIN \
    List_EmpRegistration ON Emp_Main.Registration = List_EmpRegistration.ListID INNER JOIN \
    List_EmpStatus ON Emp_Main.EmployeeStatus = List_EmpStatus.ListID INNER JOIN \
    List_DisciplineSF254 ON Emp_Main.DisciplineSF254 = List_DisciplineSF254.ListID INNER JOIN \
    List_DisciplineSF330 ON Emp_Main.DisciplineSF330 = List_DisciplineSF330.ListID \
    WHERE  (Emp_Main.EmpID > 0)`


    filterpresent=false;
    // NOTE "mysqlConnection.escape" is used to avoid sql inj with dynamic generated query parameters 
    // which is not possible with "?"
    if (firstname !== "") {
       // sql = sql+ ` AND firstname = '%${firstname}%'`;
         sql = sql+ " AND firstname Like "+ mysqlConnection.escape("%"+firstname+"%");
         filterpresent=true;
    }
    if (lastname !== "") {
        // sql = sql+ ` AND lastname LIKE '%${lastname}%'`;
        sql = sql+ " AND lastname Like "+ mysqlConnection.escape("%"+lastname+"%");
        filterpresent=true;
    }
    if (jobtitle > 0) {
        // sql = sql+ ` AND jobtitle = '${jobtitle}'`;
        sql = sql+ " AND jobtitle = "+ mysqlConnection.escape(jobtitle);
        filterpresent=true;
    }
    if (registration > 0) {
        // sql = sql+ ` AND registration = '${registration}'`;
        sql = sql+ " AND registration = "+ mysqlConnection.escape(registration);
        filterpresent=true;
    }

    


    if (search == "") {
        // console.log("No Search");
        sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        // console.log(sql);
        mysqlConnection.query(sql, (err, rows, fields) => {
            if (!err) {
                totalFiltered = totalbeforefilter;
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
        // console.log(sql);
        sql = sql + ` AND firstname LIKE '%${search}%'`;
        sql = sql + ` OR lastname LIKE '%${search}%'`;
        sql = sql + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
        sql = sql + ` OR list_empregistration.str1 LIKE '%${search}%'`;
        
        mysqlConnection.query(sql, (err, rows, fields) => {
            // if (!err) {
            //     totalFiltered = rows.length
            //     res.json({
            //         "draw": draw,
            //         "recordsTotal": totalData,
            //         "recordsFiltered": totalFiltered,
            //         "data": rows
            //     });
            // }
            // else {
            //     console.log(err);
            // }

           if (!err) {

                if (!filterpresent) {
                    totalFiltered = totalbeforefilter;
                }
                else{
                    totalFiltered = rows.length;
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













// // Search Datatable severside code
// // ***************************************************************************
// Router.post('/search', function (req, res) {
// // console.log(req.body.name);
//     let draw = req.body.draw;
//     let limit = req.body.length;
//     let offset = req.body.start;
//     // let ordercol = req.body['order[0][column]'];
//     let ordercol = req.body.order[0].column;//changed 20221130 for angular
//     // req.body['order[0][dir]'];
//     let orderdir = req.body.order[0].dir;//changed 20221130 for angular

//     let firstname=req.body.firstname;
//     let lastname=req.body.lastname; 
//     let jobtitle=req.body.jobtitle;
//     let registration=req.body.registration;

//     // to get the column name from index since dtable sends col index
//     var columns = {
//         0: 'empid',
//         1: 'firstname',
//         2: 'lastname',
//         3: 'jobtitle',
//         4: 'registration',
//         // 5: 'hiredate',
//         5: 'empid',
//     }

//     var totalData = 0;
//     var totalbeforefilter = 0;
//     var totalFiltered = 0;
//     var col = columns[ordercol];// to get name of order col not index

//     // For Getting the TotalData without Filter
//     let sql1 = `SELECT * FROM emp_main WHERE emp_main.empid>0`;
//     mysqlConnection.query(sql1, (err, rows, fields) => {
//         totalData = rows.length;
//         totalbeforefilter = rows.length;
//     });

//     let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
//     list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
//     emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
//     INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0`
 
//     filterpresent=false;
//     // NOTE "mysqlConnection.escape" is used to avoid sql inj with dynamic generated query parameters 
//     // which is not possible with "?"
//     if (firstname !== "") {
//         //sql = sql+ ` AND firstname = '%${firstname}%'`;
//          sql = sql+ " AND firstname Like "+ mysqlConnection.escape("%"+firstname+"%");
//          filterpresent=true;
//     }
//     if (lastname !== "") {
//         // sql = sql+ ` AND lastname LIKE '%${lastname}%'`;
//         sql = sql+ " AND lastname Like "+ mysqlConnection.escape("%"+lastname+"%");
//         filterpresent=true;
//     }
//     if (jobtitle > 0) {
//         // sql = sql+ ` AND jobtitle = '${jobtitle}'`;
//         sql = sql+ " AND jobtitle = "+ mysqlConnection.escape(jobtitle);
//         filterpresent=true;
//     }
//     if (registration > 0) {
//         // sql = sql+ ` AND registration = '${registration}'`;
//         sql = sql+ " AND registration = "+ mysqlConnection.escape(registration);
//         filterpresent=true;
//     }



//         sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
// // console.log(sql)
//         mysqlConnection.query(sql, (err, rows, fields) => {

//             if (!err) {

//                 if (!filterpresent) {
//                     totalFiltered = totalbeforefilter;
//                 }
//                 else{
//                     totalFiltered = rows.length;
//                 }
                
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
// });






// used with angular 20221130 with Jquery datatable
// Search Datatable severside code
// ***************************************************************************
Router.post('/angular-jquery-datatable', function (req, res) {
// console.log(req.body.name);
// console.log(req.body);
// return;
// console.log(req.body['search[value]']);
// return;


    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    let ordercol = req.body['order[0][column]'];
    // let ordercol = req.body.order[0].column;//changed 20221130 for angular
    let orderdir =  req.body['order[0][dir]'];
    // let orderdir = req.body.order[0].dir;//changed 20221130 for angular
    // let search = req.body.search.value;
    let search = req.body['search[value]'];

    let firstname=req.body.firstname;
    let lastname=req.body.lastname; 
    let jobtitle=req.body.jobtitle;
    let registration=req.body.registration;

    // to get the column name from index since dtable sends col index
    var columns = {
        0: 'empid',
        1: 'firstname',
        2: 'lastname',
        3: 'jobtitle',
        4: 'registration',
        // 5: 'hiredate',
        5: 'empid',
    }

    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index

    // For Getting the TotalData without Filter
    let sql1 = `SELECT * FROM emp_main WHERE emp_main.empid>0`;
    mysqlConnection.query(sql1, (err, rows, fields) => {
        totalData = rows.length;
        totalbeforefilter = rows.length;
    });

    let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
    list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
    emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
    INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0`
 
    filterpresent=false;
    // NOTE "mysqlConnection.escape" is used to avoid sql inj with dynamic generated query parameters 
    // which is not possible with "?"
    if (firstname !== "") {
        //sql = sql+ ` AND firstname = '%${firstname}%'`;
         sql = sql+ " AND firstname Like "+ mysqlConnection.escape("%"+firstname+"%");
         filterpresent=true;
    }
    if (lastname !== "") {
        // sql = sql+ ` AND lastname LIKE '%${lastname}%'`;
        sql = sql+ " AND lastname Like "+ mysqlConnection.escape("%"+lastname+"%");
        filterpresent=true;
    }
    if (jobtitle > 0) {
        // sql = sql+ ` AND jobtitle = '${jobtitle}'`;
        sql = sql+ " AND jobtitle = "+ mysqlConnection.escape(jobtitle);
        filterpresent=true;
    }
    if (registration > 0) {
        // sql = sql+ ` AND registration = '${registration}'`;
        sql = sql+ " AND registration = "+ mysqlConnection.escape(registration);
        filterpresent=true;
    }



    if (search == "") {
        // console.log("No Search");
        sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        // console.log(sql);
        mysqlConnection.query(sql, (err, rows, fields) => {

            // if (!err) {
            //     totalFiltered = totalbeforefilter;
            //     res.json({
            //         "draw": draw,
            //         "recordsTotal": totalData,
            //         "recordsFiltered": totalFiltered,
            //         "data": rows
            //     });
            // }
            // else {
            //     console.log(err);
            // }


            if (!err) {

                if (!filterpresent) {
                    totalFiltered = totalbeforefilter;
                }
                else{
                    totalFiltered = rows.length;
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
        // console.log(sql);
        sql = sql + ` AND firstname LIKE '%${search}%'`;
        sql = sql + ` OR lastname LIKE '%${search}%'`;
        sql = sql + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
        sql = sql + ` OR list_empregistration.str1 LIKE '%${search}%'`;

        mysqlConnection.query(sql, (err, rows, fields) => {
            if (!err) {
                totalFiltered = rows.length
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






//PREVIOUS WORKING 2023
// 20231114 Corected for Migrated(mssql to mysql) database using for search
// used with angular 20221130 with angular-datatable
// Search Datatable severside code
// *******************************************************************************************************
    
// // Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
//     Router.post('/search/angular-datatable', function (req, res) {
//     // console.log(" MYTEST  "+req.body.firstname);
//     // console.log(req.body);
//     // return;
//     // console.log(req.body['search[value]']);
//     // return;
    
    
//         let draw = req.body.draw;
//         let limit = req.body.length;
//         let offset = req.body.start;
//         // let ordercol = req.body['order[0][column]'];
//         let ordercol = req.body.order[0].column;//changed 20221130 for angular
//         // let orderdir =  req.body['order[0][dir]'];
//         let orderdir = req.body.order[0].dir;//changed 20221130 for angular
//         let search = req.body.search.value;
//         // let search = req.body['search[value]'];
    
//         let firstname=req.body.firstname;
//         let lastname=req.body.lastname; 
//         let jobtitle=req.body.jobtitle;
//         let registration=req.body.registration;
    
//         // to get the column name from index since dtable sends col index
//         // var columns = {
//         //     0: 'empid',
//         //     1: 'firstname',
//         //     2: 'lastname',
//         //     3: 'jobtitle',
//         //     4: 'registration',
//         //     // 5: 'hiredate',
//         //     5: 'empid',
//         // }

//         var columns = {
//             // 0: 'EmpID',
//             // 1: 'EmployeeID',
//             // 2: 'Firstname',
//             // 3: 'Lastname',
//             // 4: 'ComID',
//             // 5: 'JobTitle',
//             // 6: 'Department',
//             // 7: 'Registration',
//             // 8: 'HireDate',
//             // 9: 'DisciplineSF254',
//             // 10: 'DisciplineSF330',
//             // 11: 'EmployeeStatus',
//             // 12: 'ExpWithOtherFirm',
//             // // 13 => 'Employee_Consultant',
//             0: 'EmployeeID',
//             1: 'Department',
//             2: 'JobTitle',
//             3: 'Registration',
//             4: 'HireDate',

//         }


    
//         var totalData = 0;
//         var totalbeforefilter = 0;
//         var totalFiltered = 0;
//         var col = columns[ordercol];// to get name of order col not index
    
//         // For Getting the TotalData without Filter
//         let sql1 = `SELECT * FROM emp_main WHERE emp_main.EmpID>0`;
//         mysqlConnection.query(sql1, (err, rows, fields) => {
//             totalData = rows.length;
//              // totalbeforefilter = rows.length; // disabled 2023
//         });
    
//         // let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
//         // list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
//         // emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
//         // INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0`
     


//         let sql =
//         `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
//             list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
//             list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
//             emp_main.ExpWithOtherFirm
//             FROM emp_main LEFT OUTER JOIN
//             list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
//             list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
//             list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
//             list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
//             list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
//             list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
//             list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
//             list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
//             com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
//             emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
//             emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
//             pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
//             pro_main ON pro_team.ProjectID = pro_main.ProjectID
//             WHERE (emp_main.EmpID > 0)`









//         filterpresent=false;
//         // NOTE "mysqlConnection.escape" is used to avoid sql inj with dynamic generated query parameters 
//         // which is not possible with "?"
//         if (firstname !== "") {
//             //sql = sql+ ` AND firstname = '%${firstname}%'`;
//              sql = sql+ " AND Firstname Like "+ mysqlConnection.escape("%"+firstname+"%");
//              filterpresent=true;
//         }
//         if (lastname !== "") {
//             // sql = sql+ ` AND lastname LIKE '%${lastname}%'`;
//             sql = sql+ " AND Lastname Like "+ mysqlConnection.escape("%"+lastname+"%");
//             filterpresent=true;
//         }
//         if (jobtitle > 0) {
//             // sql = sql+ ` AND jobtitle = '${jobtitle}'`;
//             sql = sql+ " AND JobTitle = "+ mysqlConnection.escape(jobtitle);
//             filterpresent=true;
//         }
//         if (registration > 0) {
//             // sql = sql+ ` AND registration = '${registration}'`;
//             sql = sql+ " AND Registration = "+ mysqlConnection.escape(registration);
//             filterpresent=true;
//         }
    
    
//         //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
//         // So total filtered record is calculated before applying limit and
//         let totalbeforelimitandoffset=0;
//         let sql3 = sql + ` order by ${col} ${orderdir} `;
//         mysqlConnection.query(sql3, (err, rows3, fields) => {
//             totalbeforelimitandoffset = rows3.length;
//             // console.log("testtotal :: " +rows3.length);
//         });

    
//         if (search == "") {
//             // console.log("No Search");
//             sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//             // sql = sql + ` order by ${col} ${orderdir} `;

//             // console.log(sql);
//             console.log("sql print :: " +sql);
//             mysqlConnection.query(sql, (err, rows, fields) => {
                
//                 // if (!err) {
//                 //     totalFiltered = totalbeforefilter;
//                 //     res.json({
//                 //         "draw": draw,
//                 //         "recordsTotal": totalData,
//                 //         "recordsFiltered": totalFiltered,
//                 //         "data": rows
//                 //     });
//                 // }
//                 // else {
//                 //     console.log(err);
//                 // }

//                 if (!err) {

//                     if (!filterpresent) {
//                         //2023 important. if no filter is present totalFiltered remains totalData in table
//                         totalFiltered = totalData;
//                     }
//                     else{
//                         //2023 important. if filter is present then get totalFiltered value totalbeforelimitandoffset
//                         // before limit and offset is applied to sql string
//                         totalFiltered = totalbeforelimitandoffset;
//                         console.log("rows.length :: " +rows.length);
//                     }
//                     // console.log("totalFiltered :: " +totalData);
//                     res.json({
//                         "draw": draw,
//                         "recordsTotal": totalData,
//                         "recordsFiltered": totalFiltered,
//                         "data": rows
//                     });
//                 }
//                 else {
//                     console.log(err);
//                 }

//             });
    
//         } else {
//             // console.log(sql);
//             // sql = sql + ` AND firstname LIKE '%${search}%'`;
//             // sql = sql + ` OR lastname LIKE '%${search}%'`;
//             // sql = sql + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
//             // sql = sql + ` OR list_empregistration.str1 LIKE '%${search}%'`;


//             sql = sql + ` AND Firstname LIKE '%${search}%'`;
//             sql = sql + ` OR Lastname LIKE '%${search}%'`;
//             sql = sql + ` OR list_EmpJobTitle.str1 LIKE '%${search}%'`;
//             sql = sql + ` OR list_EmpRegistration.str1 LIKE '%${search}%'`;


//             // strsql = strsql + ` AND Emp_Main.EmployeeID LIKE '%${search}%'`;
//             // strsql = strsql + ` OR List_EmpJobTitle.str1 LIKE '%${search}%'`;
//             // // strsql = strsql + ` OR List_Department.str1 LIKE '%${search}%'`;
//             // strsql = strsql + ` OR List_EmpRegistration.str1 LIKE '%${search}%'`;
//             // // strsql = strsql + ` OR List_DisciplineSF254.str1 LIKE '%${search}%'`;
//             // // strsql = strsql + ` OR List_DisciplineSF330.str2 LIKE '%${search}%'`;


    
//             mysqlConnection.query(sql, (err, rows, fields) => {
//                 if (!err) {
//                     totalFiltered = rows.length
//                     res.json({
//                         "draw": draw,
//                         "recordsTotal": totalData,
//                         "recordsFiltered": totalFiltered,
//                         "data": rows
//                     });
//                 }
//                 else {
//                     console.log(err);
//                 }
                
//             });
    
//         } // end else
//     });
    




// async function  test(){
//     let sql1 = `SELECT * FROM emp_main WHERE emp_main.EmpID>0`;
//     mysqlConnection.query(sql1, (err, rows, fields) => {
//         totalData =  rows.length.toString();
//         // console.log("async function "+totalData)
//         // return totalData;
//         // return rows;
//         // return {"x":totalData};
//         if (!err) {
//             return totalData;
//         } else {
//             console.log(err);
//         }
//     });
// }


// https://stackoverflow.com/questions/28485032/how-to-promisify-a-mysql-function-using-bluebird
async function  test2(callback){
    let sql1 = `SELECT * FROM emp_main WHERE emp_main.EmpID>0`;
    mysqlConnection.query(sql1, (err, rows, fields) => {
        // totalData =  rows.length.toString();
        // console.log("async function "+totalData)
        // return totalData;
        // return rows;
        // return {"x":totalData};
        if (!err) {
            return callback(rows);
        } else {
            console.log(err);
        }
    });
}

// https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
async function totaldata() {
    return new Promise((resolve, reject) => {
        let totaldata;
        let sql1 = `SELECT * FROM emp_main WHERE emp_main.EmpID>0`;
        mysqlConnection.query(sql1, (err, rows, fields) => {
            if (!err) {
                totaldata=rows.length.toString();
            } else {
                console.log(err);
            }
        const data = totaldata;//'Some data';
        resolve(data);            
        });
    });
  }


  async function totalbeforelimtandoff(sql1) {
    return new Promise((resolve, reject) => {
        let totaldata;
        mysqlConnection.query(sql1, (err, rows, fields) => {
            if (!err) {
                totaldata=rows.length.toString();
            } else {
                console.log(err);
            }
        const data = totaldata;//'Some data';
        resolve(data);            
        });
    });
  }











// // 2023 USING THIS FOR ANGULAR DATATABLE 2023
// // Router.post('/angular-datatable',authenticateToken, function (req, res) { // with local auth
//  Router.post('/angular-datatable', async function (req, res) {


//     // const mysqlConnection2 = mysql.createConnection({//.createConnection({ //2024: new pool connection https://www.youtube.com/watch?v=eIjbSH3Imb8
//     //     host: 'mysqlcluster27.registeredsite.com',
//     //     user: 'ishahid_demo',
//     //     password: 'Is#kse494',
//     //     database: 'ksep_demo',
//     //     multipleStatements: true,
//     //     connectionLimit: 10,
//     // });


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
//         // 0: 'EmpID',
//         // 1: 'EmployeeID',
//         // 2: 'Firstname',
//         // 3: 'Lastname',
//         // 4: 'ComID',
//         // 5: 'JobTitle',
//         // 6: 'Department',
//         // 7: 'Registration',
//         // 8: 'HireDate',
//         // 9: 'DisciplineSF254',
//         // 10: 'DisciplineSF330',
//         // 11: 'EmployeeStatus',
//         // 12: 'ExpWithOtherFirm',
//         // // 13 => 'Employee_Consultant',
//         0: 'EmployeeID',
//         1: 'Department',
//         2: 'JobTitle',
//         3: 'Registration',
//         4: 'HireDate',
//     }


//     var totalData = 0;//req.body.totaldata;//113;//0;
//     var totalbeforefilter = 0;
//     var totalFiltered = 0;
//     var col = columns[ordercol];// to get name of order col not index
//     // // For Getting the TotalData without Filter
//     // let sql1 = `SELECT * FROM emp_main WHERE emp_main.EmpID>0`;
//     // mysqlConnection2.query(sql1, (err, rows, fields) => {
//     //     totalData = rows.length;
//     //     // totalbeforefilter = rows.length; // disabled 2023
//     // });
  
 
//     // ** After using pool conn the mysql order has changed. So to keep the order async await is used
//     // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
//     // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

//     // await test().then(json => {console.log(json)});
//     // await utils.totaldata("SELECT * FROM emp_main WHERE emp_main.EmpID>0").then(data => {totalData = data;});
//     // await utils.totaldata("SELECT COUNT(EmpID) AS total FROM emp_main WHERE emp_main.EmpID>0").then(data => {totalData = data;});
//     // const value = await totaldata();



//     // 2024 using count query in the same query for speed
//     // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
//     let sql =
//         `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
//             list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
//             list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
//             emp_main.ExpWithOtherFirm, 
//             (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata
//             FROM emp_main LEFT OUTER JOIN
//             list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
//             list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
//             list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
//             list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
//             list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
//             list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
//             list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
//             list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
//             com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
//             emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
//             emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
//             pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
//             pro_main ON pro_team.ProjectID = pro_main.ProjectID
//             WHERE (emp_main.EmpID > 0)`
 
 
//     if (search == "") {
//         // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

//         // 2024 edited for showing all records
//         if (limit==-1) {
//             sql = sql + ` order by ${col} ${orderdir} `;
//         } else {
//             sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//         }
        
//         // sql = sql + ` order by ${col} ${orderdir} `;
       


//       mysqlConnection.query(sql, (err, rows, fields) => {

//             if (!err) {

//                 // totalData = rows[0].totaldata;
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

//         sql = sql + ` AND Firstname LIKE '%${search}%'`;
//         sql = sql + ` OR Lastname LIKE '%${search}%'`;
//         sql = sql + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
//         sql = sql + ` OR list_empregistration.str1 LIKE '%${search}%'`;
//         sql = sql + ` OR list_department.Str1 LIKE '%${search}%'`;
//         sql = sql + ` OR emp_main.HireDate LIKE '%${search}%'`;
//         sql = sql + ` OR emp_main.EmployeeID LIKE '%${search}%'`;


//         // //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
//         // So total filtered record is calculated before applying limit and
 
//         let totalbeforelimitandoffset = 0;
//         let sql3 = sql + ` order by ${col} ${orderdir} `;
//         // mysqlConnection.query(sql3, (err, rows3, fields) => {
//         //     totalbeforelimitandoffset = rows3.length;
//         // });
//     // ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
//     // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
//     // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
//        await utils.totalbeforelimtandoff(sql3).then(data => {totalbeforelimitandoffset = data;});
 
 
//         // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

//         // 2024 edited for showing all records
//         if (limit==-1) {
//             sql = sql + ` order by ${col} ${orderdir} `;
//         } else {
//             sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//         }

//      mysqlConnection.query(sql, (err, rows, fields) => {
//             if (!err) {
//                 // totalData = rows[0].totaldata;
//                 if (rows.length>0) {
//                     totalData = rows[0].totaldata;
//                 }
//                 totalFiltered = totalbeforelimitandoffset
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
//     // mysqlConnection2.end();
// });







// 2024 USING THIS FOR ANGULAR DATATABLE 2024
// Router.post('/angular-datatable',authenticateToken, function (req, res) { // with local auth
Router.post('/angular-datatable', async function (req, res) {


    // const mysqlConnection2 = mysql.createConnection({//.createConnection({ //2024: new pool connection https://www.youtube.com/watch?v=eIjbSH3Imb8
    //     host: 'mysqlcluster27.registeredsite.com',
    //     user: 'ishahid_demo',
    //     password: 'Is#kse494',
    //     database: 'ksep_demo',
    //     multipleStatements: true,
    //     connectionLimit: 10,
    // });


    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    // let ordercol = req.body['order[0][column]'];
    let ordercol = req.body.order[0].column;//changed 20221130 for angular
    // let orderdir =  req.body['order[0][dir]'];
    let orderdir = req.body.order[0].dir;//changed 20221130 for angular
    let search = req.body.search.value;
    // let search = req.body['search[value]'];

    var columns = {
        // 0: 'EmpID',
        // 1: 'EmployeeID',
        // 2: 'Firstname',
        // 3: 'Lastname',
        // 4: 'ComID',
        // 5: 'JobTitle',
        // 6: 'Department',
        // 7: 'Registration',
        // 8: 'HireDate',
        // 9: 'DisciplineSF254',
        // 10: 'DisciplineSF330',
        // 11: 'EmployeeStatus',
        // 12: 'ExpWithOtherFirm',
        // // 13 => 'Employee_Consultant',

       //** This is needed for order by to work and exact field name should be used
        0: 'EmployeeID',
        1: 'Department',
        2: 'JobTitle',
        3: 'Registration',
        4: 'HireDate',
    }


    var totalData = 0;//req.body.totaldata;//113;//0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index
    // // For Getting the TotalData without Filter
    // let sql1 = `SELECT * FROM emp_main WHERE emp_main.EmpID>0`;
    // mysqlConnection2.query(sql1, (err, rows, fields) => {
    //     totalData = rows.length;
    //     // totalbeforefilter = rows.length; // disabled 2023
    // });


    // ** After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

    // await test().then(json => {console.log(json)});
    // await utils.totaldata("SELECT * FROM emp_main WHERE emp_main.EmpID>0").then(data => {totalData = data;});
    //    await utils.totaldata("SELECT COUNT(EmpID) AS total FROM emp_main WHERE emp_main.EmpID>0").then(data => {totalData = data;});
    // const value = await totaldata();


    // let sql =
    //     `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
    //         list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
    //         list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
    //         emp_main.ExpWithOtherFirm
    //         FROM emp_main LEFT OUTER JOIN
    //         list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
    //         list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
    //         list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
    //         list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
    //         list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
    //         list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
    //         list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
    //         list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
    //         com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
    //         emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
    //         emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
    //         pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
    //         pro_main ON pro_team.ProjectID = pro_main.ProjectID
    //         WHERE (emp_main.EmpID > 0)`



    let from = ` FROM emp_main LEFT OUTER JOIN
        list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
        list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
        list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
        list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
        list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
        list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
        list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
        list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
        com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
        emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
        emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
        pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
        pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0 `



    // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
    // https://stackoverflow.com/questions/15710930/mysql-select-distinct-count
    var sqlWhere = '';
    let sql =
        `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
      list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
      list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
      emp_main.ExpWithOtherFirm, 
      (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
      (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
      FROM emp_main LEFT OUTER JOIN
      list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
      list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
      list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
      list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
      list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
      list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
      list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
      list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
      com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
      emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
      emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
      pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
      pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0`



    if (search == "") {
        // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

        // 2024 edited for showing all records
        if (limit == -1) {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
        } else {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        }

        // sql = sql + ` order by ${col} ${orderdir} `;



        mysqlConnection.query(sql, (err, rows, fields) => {

            if (!err) {

                // totalFiltered = totalData;
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

        // sqlWhere = sqlWhere + ` AND Firstname LIKE '%${search}%'`;
        // sqlWhere = sqlWhere + ` OR Lastname LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` AND emp_main.EmployeeID LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_empregistration.str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_department.Str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR emp_main.HireDate LIKE '%${search}%'`;



        sql =
            `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
      list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
      list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
      emp_main.ExpWithOtherFirm, 
      (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
      (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
      FROM emp_main LEFT OUTER JOIN
      list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
      list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
      list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
      list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
      list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
      list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
      list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
      list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
      com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
      emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
      emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
      pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
      pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0`



        // //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
        // So total filtered record is calculated before applying limit and

        // let totalbeforelimitandoffset = 0;
        // let sql3 = sql + ` order by ${col} ${orderdir} `;
        // mysqlConnection.query(sql3, (err, rows3, fields) => {
        //     totalbeforelimitandoffset = rows3.length;
        // });
        // ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
        // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
        // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
        //    await utils.totalbeforelimtandoff(sql3).then(data => {totalbeforelimitandoffset = data;});


        // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

        // 2024 edited for showing all records
        if (limit == -1) {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
        } else {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        }

        mysqlConnection.query(sql, (err, rows, fields) => {
            if (!err) {
                // totalFiltered = totalbeforelimitandoffset
                // totalData = rows[0].totaldata;
                // totalFiltered = rows[0].totalfiltered;
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
    // mysqlConnection2.end();
});











// // USING THIS 2023
// // Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/search/angular-datatable', async function (req, res) {
//     // console.log(" MYTEST  "+req.body.firstname);
//     // console.log(req.body);
//     // return;
//     // console.log(req.body['search[value]']);
//     // return;
    
    
//         let draw = req.body.draw;
//         let limit = req.body.length;
//         let offset = req.body.start;
//         // let ordercol = req.body['order[0][column]'];
//         let ordercol = req.body.order[0].column;//changed 20221130 for angular
//         // let orderdir =  req.body['order[0][dir]'];
//         let orderdir = req.body.order[0].dir;//changed 20221130 for angular
//         let search = req.body.search.value;
//         // let search = req.body['search[value]'];
    


//         // let firstname=req.body.firstname;
//         // let lastname=req.body.lastname; 
//         // let jobtitle=req.body.jobtitle;
//         // let registration=req.body.registration;

//         let jobtitle = req.body.jobtitle;
//         let department = req.body.department;
//         let registration = req.body.registration;
//         let disciplinesf254 = req.body.disciplinesf254;
//         let disciplinesf330 = req.body.disciplinesf330;
//         let employeestatus = req.body.employeestatus;
//         let comid = req.body.comid;
//         let empdegree = req.body.empdegree;
//         let emptraining = req.body.emptraining;
//         let owner = req.body.owner;
//         let client = req.body.client;
//         let proocategory = req.body.proocategory;
//         let projecttype = req.body.projecttype;
//         let empprojectrole = req.body.empprojectrole;



    
//         // to get the column name from index since dtable sends col index
//         // var columns = {
//         //     0: 'empid',
//         //     1: 'firstname',
//         //     2: 'lastname',
//         //     3: 'jobtitle',
//         //     4: 'registration',
//         //     // 5: 'hiredate',
//         //     5: 'empid',
//         // }

//         var columns = {
//             // 0: 'EmpID',
//             // 1: 'EmployeeID',
//             // 2: 'Firstname',
//             // 3: 'Lastname',
//             // 4: 'ComID',
//             // 5: 'JobTitle',
//             // 6: 'Department',
//             // 7: 'Registration',
//             // 8: 'HireDate',
//             // 9: 'DisciplineSF254',
//             // 10: 'DisciplineSF330',
//             // 11: 'EmployeeStatus',
//             // 12: 'ExpWithOtherFirm',
//             // // 13 => 'Employee_Consultant',
//             0: 'EmployeeID',
//             1: 'Department',
//             2: 'JobTitle',
//             3: 'Registration',
//             4: 'HireDate',

//         }


    
//         var totalData = 0;
//         var totalbeforefilter = 0;
//         var totalFiltered = 0;
//         var col = columns[ordercol];// to get name of order col not index
    
//         // // For Getting the TotalData without Filter
//         // let sql1 = `SELECT * FROM emp_main WHERE emp_main.EmpID>0`;
//         // mysqlConnection.query(sql1, (err, rows, fields) => {
//         //     totalData = rows.length;
//         //      // totalbeforefilter = rows.length; // disabled 2023
//         // });

//     // ** After using pool conn the mysql order has changed. So to keep the order async await is used
//     // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
//     // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

//     // await test().then(json => {console.log(json)});
//     // await utils.totaldata("SELECT * FROM emp_main WHERE emp_main.EmpID>0").then(data => {totalData = data;});
//     //    await utils.totaldata("SELECT COUNT(EmpID) AS total FROM emp_main WHERE emp_main.EmpID>0").then(data => {totalData = data;});
//     // const value = await totaldata();
    
//         // let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
//         // list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
//         // emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
//         // INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0`
     


//         let sql =
//         `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
//             list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
//             list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
//             emp_main.ExpWithOtherFirm,
//             (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata
//             FROM emp_main LEFT OUTER JOIN
//             list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
//             list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
//             list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
//             list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
//             list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
//             list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
//             list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
//             list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
//             com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
//             emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
//             emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
//             pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
//             pro_main ON pro_team.ProjectID = pro_main.ProjectID
//             WHERE (emp_main.EmpID > 0)`





//         filterpresent=false;
//         // NOTE "mysqlConnection.escape" is used to avoid sql inj with dynamic generated query parameters 
//         // which is not possible with "?"
//         // if (firstname !== "") {
//         //     //sql = sql+ ` AND firstname = '%${firstname}%'`;
//         //      sql = sql+ " AND Firstname Like "+ mysqlConnection.escape("%"+firstname+"%");
//         //      filterpresent=true;
//         // }
//         // if (lastname !== "") {
//         //     // sql = sql+ ` AND lastname LIKE '%${lastname}%'`;
//         //     sql = sql+ " AND Lastname Like "+ mysqlConnection.escape("%"+lastname+"%");
//         //     filterpresent=true;
//         // }
//         // if (jobtitle > 0) {
//         //     // sql = sql+ ` AND jobtitle = '${jobtitle}'`;
//         //     sql = sql+ " AND JobTitle = "+ mysqlConnection.escape(jobtitle);
//         //     filterpresent=true;
//         // }
//         // if (registration > 0) {
//         //     // sql = sql+ ` AND registration = '${registration}'`;
//         //     sql = sql+ " AND Registration = "+ mysqlConnection.escape(registration);
//         //     filterpresent=true;
//         // }
    




//         if (jobtitle > 0) {
//             sql = sql + ` AND emp_main.JobTitle = ${jobtitle}`
//             filterpresent = true;
//         }
//         if (department > 0) {
//             sql = sql + ` AND emp_main.Department = ${department}`
//             filterpresent = true;
//         }
//         if (registration > 0) {
//             sql = sql + ` AND emp_main.Registration = ${registration}`
//             filterpresent = true;
//         }
//         if (disciplinesf254 > 0) {
//             sql = sql + ` AND emp_main.DisciplineSF254 = ${disciplinesf254}`
//             filterpresent = true;
//         }
//         if (disciplinesf330 > 0) {
//             sql = sql + ` AND emp_main.DisciplineSF330 = ${disciplinesf330}`
//             filterpresent = true;
//         }
//         if (employeestatus > 0) {
//             sql = sql + ` AND emp_main.EmployeeStatus = ${employeestatus}`
//             filterpresent = true;
//         }
//         if (comid > 0) {
//             sql = sql + ` AND emp_main.ComID = ${comid}`
//             filterpresent = true;
//         }
    
    
//         // Employee CHILD Multi Table search. Include inner joins here with where clause
//         if (empdegree > 0) {
//             sql = sql + ` AND emp_degree.Degree = ${empdegree}`
//             filterpresent = true;
//         }
//         if (emptraining > 0) {
//             sql = sql + ` AND emp_training.TrainingName = ${emptraining}`
//             filterpresent = true;
//         }
    
//         // PROJECT Related Multi Table search. 
//         if (projecttype > 0) {
//             sql = sql + ` AND pro_main.PrimaryProjectType = ${projecttype}`
//             filterpresent = true;
//         }
//         if (projecttype > 0) {
//             sql = sql + ` AND pro_main.PrimaryProjectType = ${projecttype}`
//             filterpresent = true;
//         }
//         if (projecttype > 0) {
//             sql = sql + ` AND pro_main.PrimaryProjectType = ${projecttype}`
//             filterpresent = true;
//         }
//         if (projecttype > 0) {
//             sql = sql + ` AND pro_main.PrimaryProjectType = ${projecttype}`
//             filterpresent = true;
//         }
//         if (owner > 0) {
//             sql = sql + ` AND pro_main.Owner = ${owner}`
//             filterpresent = true;
//         }
//         if (client > 0) {
//             sql = sql + ` AND pro_main.Client = ${client}`
//             filterpresent = true;
//         }
//         if (proocategory > 0) {
//             sql = sql + ` AND pro_main.OwnerCategory = ${proocategory}`
//             filterpresent = true;
//         }
//         if (empprojectrole > 0) {
//             sql = sql + ` AND pro_team.EmpProjectRole = ${empprojectrole}`
//             filterpresent = true;
//         }






    
//         //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
//         // So total filtered record is calculated before applying limit and
//         let totalbeforelimitandoffset=0;
//         let sql3 = sql + ` order by ${col} ${orderdir} `;
//         // mysqlConnection.query(sql3, (err, rows3, fields) => {
//         //     totalbeforelimitandoffset = rows3.length;
//         //     // console.log("testtotal :: " +rows3.length);
//         // });

//     // ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
//     // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
//     // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
//         await utils.totalbeforelimtandoff(sql3).then(data => {totalbeforelimitandoffset = data;});
//         if (search == "") {
//             // console.log("No Search");

//         // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

//         // 2024 edited for showing all records
//         if (limit==-1) {
//             sql = sql + ` order by ${col} ${orderdir} `;
//         } else {
//             sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//             // console.log("test2 "+sql);
//         }
//             // sql = sql + ` order by ${col} ${orderdir} `;

//             // console.log(sql);
//             // console.log("sql print :: " +sql);
//             mysqlConnection.query(sql, (err, rows, fields) => {
                
//                 // if (!err) {
//                 //     totalFiltered = totalbeforefilter;
//                 //     res.json({
//                 //         "draw": draw,
//                 //         "recordsTotal": totalData,
//                 //         "recordsFiltered": totalFiltered,
//                 //         "data": rows
//                 //     });
//                 // }
//                 // else {
//                 //     console.log(err);
//                 // }

//                 if (!err) {

//                     if (!filterpresent) {
//                         //2023 important. if no filter is present totalFiltered remains totalData in table
//                         //2024
//                         if (rows.length>0) {
//                             totalData = rows[0].totaldata;
//                         }
//                         totalFiltered = totalData;
//                     }
//                     else{
//                         //2023 important. if filter is present then get totalFiltered value totalbeforelimitandoffset
//                         // before limit and offset is applied to sql string
//                         //2024
//                         if (rows.length>0) {
//                             totalData = rows[0].totaldata;
//                         }
//                         totalFiltered = totalbeforelimitandoffset;
//                         console.log("rows.length :: " +rows.length);
//                     }
//                     // console.log("totalFiltered :: " +totalData);
//                     res.json({
//                         "draw": draw,
//                         "recordsTotal": totalData,
//                         "recordsFiltered": totalFiltered,
//                         "data": rows
//                     });
//                 }
//                 else {
//                     console.log(err);
//                 }

//             });
    
//         } else {
//             // console.log(sql);
//             // sql = sql + ` AND firstname LIKE '%${search}%'`;
//             // sql = sql + ` OR lastname LIKE '%${search}%'`;
//             // sql = sql + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
//             // sql = sql + ` OR list_empregistration.str1 LIKE '%${search}%'`;


//             // sql = sql + ` AND Firstname LIKE '%${search}%'`;
//             // sql = sql + ` OR Lastname LIKE '%${search}%'`;
//             sql = sql + ` AND emp_main.EmployeeID LIKE '%${search}%'`;
//             sql = sql + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
//             sql = sql + ` OR list_empregistration.str1 LIKE '%${search}%'`;
//             sql = sql + ` OR list_department.Str1 LIKE '%${search}%'`;
//             sql = sql + ` OR emp_main.HireDate LIKE '%${search}%'`;
            

//             await utils.totalbeforelimtandoff(sql).then(data => {totalbeforelimitandoffset = data;});

//             // 2024 edited for showing all records
//             if (limit==-1) {
//                 sql = sql + ` order by ${col} ${orderdir} `;
//             } else {
//                 sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//             }


//             // strsql = strsql + ` AND Emp_Main.EmployeeID LIKE '%${search}%'`;
//             // strsql = strsql + ` OR List_EmpJobTitle.str1 LIKE '%${search}%'`;
//             // // strsql = strsql + ` OR List_Department.str1 LIKE '%${search}%'`;
//             // strsql = strsql + ` OR List_EmpRegistration.str1 LIKE '%${search}%'`;
//             // // strsql = strsql + ` OR List_DisciplineSF254.str1 LIKE '%${search}%'`;
//             // // strsql = strsql + ` OR List_DisciplineSF330.str2 LIKE '%${search}%'`;


    
//             mysqlConnection.query(sql, (err, rows, fields) => {
//                 if (!err) {
//                     //2024
//                     if (rows.length>0) {
//                         totalData = rows[0].totaldata;
//                     }
//                 // totalFiltered = rows.length;
//                 totalFiltered = totalbeforelimitandoffset;//rows.length;
//                     res.json({
//                         "draw": draw,
//                         "recordsTotal": totalData,
//                         "recordsFiltered": totalFiltered,
//                         "data": rows
//                     });
//                 }
//                 else {
//                     console.log(err);
//                 }
                
//             });
    
//         } // end else
//     });








// 2024 USING THIS (with count in same query for faster loading)
// https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
Router.post('/search/angular-datatable', async function (req, res) {

    
        let draw = req.body.draw;
        let limit = req.body.length;
        let offset = req.body.start;
        // let ordercol = req.body['order[0][column]'];
        let ordercol = req.body.order[0].column;//changed 20221130 for angular
        // let orderdir =  req.body['order[0][dir]'];
        let orderdir = req.body.order[0].dir;//changed 20221130 for angular
        let search = req.body.search.value;
        // let search = req.body['search[value]'];
    
        let jobtitle = req.body.jobtitle;
        let department = req.body.department;
        let registration = req.body.registration;
        let disciplinesf254 = req.body.disciplinesf254;
        let disciplinesf330 = req.body.disciplinesf330;
        let employeestatus = req.body.employeestatus;
        let comid = req.body.comid;
        let empdegree = req.body.empdegree;
        let emptraining = req.body.emptraining;
        let owner = req.body.owner;
        let client = req.body.client;
        let proocategory = req.body.proocategory;
        let projecttype = req.body.projecttype;
        let empprojectrole = req.body.empprojectrole;



    
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

        //** This is needed for order by to work and exact field name should be used
        var columns = {
            // 0: 'EmpID',
            // 1: 'EmployeeID',
            // 2: 'Firstname',
            // 3: 'Lastname',
            // 4: 'ComID',
            // 5: 'JobTitle',
            // 6: 'Department',
            // 7: 'Registration',
            // 8: 'HireDate',
            // 9: 'DisciplineSF254',
            // 10: 'DisciplineSF330',
            // 11: 'EmployeeStatus',
            // 12: 'ExpWithOtherFirm',
            // // 13 => 'Employee_Consultant',

            //** This is needed for order by to work and exact field name should be used
            0: 'EmployeeID',
            1: 'Department',
            2: 'JobTitle',
            3: 'Registration',
            4: 'HireDate',
        }


    
        var totalData = 0;
        // var totalbeforefilter = 0;
        var totalFiltered = 0;
        var col = columns[ordercol];// to get name of order col not index
    
        // // For Getting the TotalData without Filter
        // let sql1 = `SELECT * FROM emp_main WHERE emp_main.EmpID>0`;
        // mysqlConnection.query(sql1, (err, rows, fields) => {
        //     totalData = rows.length;
        //      // totalbeforefilter = rows.length; // disabled 2023
        // });

    // ** After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

    // await test().then(json => {console.log(json)});
    // await utils.totaldata("SELECT * FROM emp_main WHERE emp_main.EmpID>0").then(data => {totalData = data;});
    //    await utils.totaldata("SELECT COUNT(EmpID) AS total FROM emp_main WHERE emp_main.EmpID>0").then(data => {totalData = data;});
    // const value = await totaldata();
    
        // let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
        // list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
        // emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
        // INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0`
     
        // var sqlWhere = '';

        // let sql =
        // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
        //     list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
        //     list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
        //     emp_main.ExpWithOtherFirm, 
        //     (select count(*) from emp_main ) as totaldata, 
        //     (select count(*) from emp_main WHERE ${sqlWhere}) as totaldata, 
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
        //     pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0`






        // NOTE "mysqlConnection.escape" is used to avoid sql inj with dynamic generated query parameters 
        // which is not possible with "?"
        // if (firstname !== "") {
        //     //sql = sql+ ` AND firstname = '%${firstname}%'`;
        //      sql = sql+ " AND Firstname Like "+ mysqlConnection.escape("%"+firstname+"%");
        //      filterpresent=true;
        // }
        // if (lastname !== "") {
        //     // sql = sql+ ` AND lastname LIKE '%${lastname}%'`;
        //     sql = sql+ " AND Lastname Like "+ mysqlConnection.escape("%"+lastname+"%");
        //     filterpresent=true;
        // }
        // if (jobtitle > 0) {
        //     // sql = sql+ ` AND jobtitle = '${jobtitle}'`;
        //     sql = sql+ " AND JobTitle = "+ mysqlConnection.escape(jobtitle);
        //     filterpresent=true;
        // }
        // if (registration > 0) {
        //     // sql = sql+ ` AND registration = '${registration}'`;
        //     sql = sql+ " AND Registration = "+ mysqlConnection.escape(registration);
        //     filterpresent=true;
        // }
    



        var sqlWhere = '';
        filterpresent=false;

        if (jobtitle > 0) {
            // sql = sql + ` AND emp_main.JobTitle = ${jobtitle}`
            sqlWhere = sqlWhere + ` AND emp_main.JobTitle = ${jobtitle}`
            filterpresent = true;
        }
        if (department > 0) {
            sqlWhere = sqlWhere + ` AND emp_main.Department = ${department}`
            filterpresent = true;
        }
        if (registration > 0) {
            sqlWhere = sqlWhere + ` AND emp_main.Registration = ${registration}`
            filterpresent = true;
        }
        if (disciplinesf254 > 0) {
            sqlWhere = sqlWhere + ` AND emp_main.DisciplineSF254 = ${disciplinesf254}`
            filterpresent = true;
        }
        if (disciplinesf330 > 0) {
            sqlWhere = sqlWhere + ` AND emp_main.DisciplineSF330 = ${disciplinesf330}`
            filterpresent = true;
        }
        if (employeestatus > 0) {
            sqlWhere = sqlWhere + ` AND emp_main.EmployeeStatus = ${employeestatus}`
            filterpresent = true;
        }
        if (comid > 0) {
            sqlWhere = sqlWhere + ` AND emp_main.ComID = ${comid}`
            filterpresent = true;
        }
    
    
        // Employee CHILD Multi Table search. Include inner joins here with where clause
        if (empdegree > 0) {
            sqlWhere = sqlWhere + ` AND emp_degree.Degree = ${empdegree}`
            filterpresent = true;
        }
        if (emptraining > 0) {
            sqlWhere = sqlWhere + ` AND emp_training.TrainingName = ${emptraining}`
            filterpresent = true;
        }
    
        // PROJECT Related Multi Table search. 
        if (projecttype > 0) {
            sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
            filterpresent = true;
        }
        if (projecttype > 0) {
            sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
            filterpresent = true;
        }
        if (projecttype > 0) {
            sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
            filterpresent = true;
        }
        if (projecttype > 0) {
            sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
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
        if (proocategory > 0) {
            sqlWhere = sqlWhere + ` AND pro_main.OwnerCategory = ${proocategory}`
            filterpresent = true;
        }
        if (empprojectrole > 0) {
            sqlWhere = sqlWhere + ` AND pro_team.EmpProjectRole = ${empprojectrole}`
            filterpresent = true;
        }



        // 2024 Avoid using multiple sql for speed
        // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
        
    let from = ` FROM emp_main LEFT OUTER JOIN
        list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
        list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
        list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
        list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
        list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
        list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
        list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
        list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
        com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
        emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
        emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
        pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
        pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0 `
        
        // (select count(*) from emp_main WHERE emp_main.EmpID>0 ${sqlWhere}) as totalfiltered 

        // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
        // https://stackoverflow.com/questions/15710930/mysql-select-distinct-count
        let sql =
        `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
            list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
            list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
            emp_main.ExpWithOtherFirm, 
            (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
            (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
            FROM emp_main LEFT OUTER JOIN
            list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
            list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
            list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
            list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
            list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
            list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
            list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
            list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
            com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
            emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
            emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
            pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
            pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0`
 
  
    
        //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
        // So total filtered record is calculated before applying limit and
        // let totalbeforelimitandoffset=0;
        // let sql3 = sql + ` order by ${col} ${orderdir} `;
        // mysqlConnection.query(sql3, (err, rows3, fields) => {
        //     totalbeforelimitandoffset = rows3.length;
        //     // console.log("testtotal :: " +rows3.length);
        // });

    // ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
        // await utils.totalbeforelimtandoff(sql3).then(data => {totalbeforelimitandoffset = data;});


 
    if (search == "") {
        // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

        // 2024 edited for showing all records
        if (limit == -1) {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
        } else {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        }
        // sql = sql + ` order by ${col} ${orderdir} `;
        mysqlConnection.query(sql, (err, rows, fields) => {
            if (!err) {

                if (!filterpresent) {
                    //2023 important. if no filter is present totalFiltered remains totalData in table
                    // totalFiltered = totalData;
                    if (rows.length>0) {
                        totalData = rows[0].totaldata;
                    }
                    totalFiltered = totalData;
                }  
                else {
                    //2023 important. if filter is present then get totalFiltered value totalbeforelimitandoffset
                    // before limit and offset is applied to sql string
                    // totalFiltered = totalbeforelimitandoffset;
                    // totalData = rows[0].totaldata;
                    // totalFiltered = rows[0].totalfiltered;
                    if (rows.length>0) {
                        totalData = rows[0].totaldata;
                    }
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
    
        
        // console.log(sql);
        // sql = sql + ` AND firstname LIKE '%${search}%'`;
        // sql = sql + ` OR lastname LIKE '%${search}%'`;
        // sql = sql + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
        // sql = sql + ` OR list_empregistration.str1 LIKE '%${search}%'`;


        // sql = sql + sqlWhere + ` AND Firstname LIKE '%${search}%'`;
        // sql = sql + sqlWhere + ` OR Lastname LIKE '%${search}%'`;
        // sql = sql + sqlWhere + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
        // sql = sql + sqlWhere + ` OR list_empregistration.str1 LIKE '%${search}%'`;
        // sql = sql + sqlWhere + ` OR list_department.Str1 LIKE '%${search}%'`;
        // sql = sql + sqlWhere + ` OR emp_main.HireDate LIKE '%${search}%'`;
        // sql = sql + sqlWhere + ` OR emp_main.EmployeeID LIKE '%${search}%'`;


        // sqlWhere = sqlWhere + ` AND Firstname LIKE '%${search}%'`;
        // sqlWhere = sqlWhere + ` OR Lastname LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` AND emp_main.EmployeeID LIKE '%${search}%'`;        
        sqlWhere = sqlWhere + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_empregistration.str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR list_department.Str1 LIKE '%${search}%'`;
        sqlWhere = sqlWhere + ` OR emp_main.HireDate LIKE '%${search}%'`;
        


        sql =
        `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
            list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
            list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
            emp_main.ExpWithOtherFirm, 
            (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
            (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
            FROM emp_main LEFT OUTER JOIN
            list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
            list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
            list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
            list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
            list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
            list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
            list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
            list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
            com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
            emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
            emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
            pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
            pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0`

     

            if (limit == -1) {
                sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
            } else {
                sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
                console.log("stringsearch : " + sql);
            }

        // strsql = strsql + ` AND Emp_Main.EmployeeID LIKE '%${search}%'`;
        // strsql = strsql + ` OR List_EmpJobTitle.str1 LIKE '%${search}%'`;
        // // strsql = strsql + ` OR List_Department.str1 LIKE '%${search}%'`;
        // strsql = strsql + ` OR List_EmpRegistration.str1 LIKE '%${search}%'`;
        // // strsql = strsql + ` OR List_DisciplineSF254.str1 LIKE '%${search}%'`;
        // // strsql = strsql + ` OR List_DisciplineSF330.str2 LIKE '%${search}%'`;


        mysqlConnection.query(sql, (err, rows, fields) => {
            if (!err) {
                // totalFiltered = rows.length
                // totalFiltered = rows[0].totalfiltered;
                // totalData = rows[0].totaldata;
                // totalFiltered = rows[0].totalfiltered;

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
















// EDIT GET
Router.get('/:empid', function (req, res) {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
   

    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmpID=?", req.param('empid'), (err, rows, fields) => {
        mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmpID=?", req.param('empid'), (err, rows, fields) => {
  
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




// // DETAIL PAGE
// Router.get('/empdetails/:empid', function (req, res) {
//     // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
//     mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid=?", req.param('empid'), (err, rows, fields) => {
//         if (!err) {
//             res.send(rows[0]);
//             // res.render("Hello.ejs", {name:rows});
//         } else {
//             console.log(err);
//         }
//     });
// });




// 20231114 Corected for Migrated(mssql to mysql) database using for search
// DETAIL PAGE used in ANGULAR 2022 to get jobtitle name instead of id
Router.get('/empdetails/:empid', function (req, res) {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
    mysqlConnection.query(

        // `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
        // list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
        // emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
        // INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid=?`

        // `SELECT emp_main.EmpID,emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, list_empjobtitle.Str1 AS jobtitle, \
        // list_empregistration.Str1 AS registration, emp_main.Employee_Consultant, emp_main.HireDate  \
        //  FROM emp_main INNER JOIN list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID \
        // INNER JOIN list_empregistration on emp_main.Registration=list_empregistration.ListID WHERE emp_main.EmpID=?`
       
        `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID,emp_main.FullName, emp_main.Firstname, emp_main.Lastname,emp_main.MiddleI, com_main.CompanyName AS ComID, emp_main.Employee_Consultant,
        list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
        list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
        emp_main.ExpWithOtherFirm
        FROM emp_main LEFT OUTER JOIN
        list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
        list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
        list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
        list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
        list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
        list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
        list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
        list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
        com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
        emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
        emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
        pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
        pro_main ON pro_team.ProjectID = pro_main.ProjectID
        WHERE emp_main.EmpID=?`
      ,


     req.param('empid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});


// let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
// list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
// emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
// INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid=?`












 


// INSERT
// Router.post('/', function (req, res) {
    // With express-Validator   
    Router.post('/',[ 
        check('lastname',"Lastname cannot be empty.").notEmpty(),
        check('firstname',"Firstname cannot be empty.").notEmpty(),
        check('employeeid',"EmployeeID cannot be empty.").notEmpty()

        ], 
       async function (req, res) {
           
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        var maxid = 0;
        // when query result from a function is called  it doesnt return a value.  So promise is used
        // we needed async function for execution sequence, and async function returns promise not any plain value. so Promise is used
        // await utils.maxid("SELECT COUNT(ID) AS total FROM emp_registration WHERE emp_registration.EmpID="+ req.body.empid)
        await utils.maxid("emp_main","EmpID")
        .then(data => {
            maxid = data;
        });


    // console.log(req.body);
    // return
    // console.log(req.body.hiredate);
           req.body.empid = maxid + 1;
           let postdata = req.body; 


    // if(req.body.hiredate==null){
    //     req.body.hiredate="0000-00-00";
    // }



    // Create EmployeeID
    //******************************* */
    // let fname = (req.body.firstname).charAt(0);
    // req.body.employeeid=req.body.lastname +fname+req.body.middlei; // added 2023

    // console.log("test9 "+req.body.empid);

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




    mysqlConnection.query('INSERT INTO emp_main SET ?', postdata, function (error, results, fields) {
        if (!error) {
            console.log("success");
            res.send(results);
        } else {
            console.log(error);
        }
    });
});




// DELETE
Router.delete('/:empid', function (req, res) {

    mysqlConnection.query("DELETE FROM emp_main WHERE empid=?", req.param('empid'), (err, rows, fields) => {
  
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});




// UPDATE
Router.post('/update', [
    check('lastname', "Lastname cannot be empty.").notEmpty(),
    check('firstname', "Firstname cannot be empty.").notEmpty(),//.isEmail().withMessage('Firstname TEST must contain a number')
    check('employeeid',"EmployeeID cannot be empty.").notEmpty()
],
    function (req, res) {
        // console.log("test3 "+req.body.employeeid);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }




        //Consulant Checked send 1, but unchecked sends null so be manually put in 0
        // if (req.body.consultant == null) {
        //     req.body.consultant = 0;
        // }
        if (req.body.employee_consultant == null) {
            req.body.employee_consultant = 0;
        }
        // console.log("test3 "+req.body.employeeid);
        let post3 = req.body;

        // let query = `UPDATE emp_main  SET ? WHERE empid=?`;
        let query = `UPDATE emp_main  SET ? WHERE EmpID=?`;
        mysqlConnection.query(query, [post3, req.body.empid], (err, rows, fields) => {
            if (!err) {
                res.send(rows);
                console.log(post3);
            } else {
                console.log("err");
            }
        });
    });











module.exports = Router;

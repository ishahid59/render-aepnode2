const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const utils = require('../utils');



// DETAIL PAGE used in ANGULAR 2022 to get jobtitle name instead of id
Router.get('/empresumetextdetails/:empid', async (req, res) => {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
    mysqlConnection.query(

        `SELECT * from emp_resumetext WHERE EmpID = ?`    , 
         
     req.param('empid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});





Router.get('/maxempresumetextid', function (req, res) {
    // console.log("from maxempid"); 
    mysqlConnection.query("SELECT MAX(ID) as maxempresumetextid FROM  emp_resumetext", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
        // res.send(result[0].empid);
    });

});




// SELECT COUNT(id) FROM table WHERE id = 123
Router.get('/checkforempid/:empid', function (req, res) {
        mysqlConnection.query(

            // `SELECT COUNT(ProjectID) FROM pro_datesandcosts WHERE pro_datesandcosts.ProjectID = ?`    ,  
            // `SELECT COUNT(ProjectID) as FROM pro_datesandcosts WHERE pro_datesandcosts.ProjectID = ?`    ,  
            `SELECT *  FROM emp_resumetext WHERE emp_resumetext.EmpID = ?`    ,  


         req.param('empid'), (err, rows, fields) => {
            if (!err) {
                // res.send(rows[0]);
                res.send( rows);
                // console.log( "count"  +rows.length);
                // res.render("Hello.ejs", {name:rows});
            } else {
                console.log(err);
            }
        });
});





// EDIT GET
Router.get('/:id',  (req, res) => {
    // let sql = "SELECT emp_degree.id, emp_degree.degree as str1,emp_degree.empid FROM emp_degree WHERE emp_degree.empid=? ORDER BY emp_degree.id";
    //    let x= getmaxid(5,5);
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmpID=?", req.param('empid'), (err, rows, fields) => {

    let sql = "SELECT * FROM emp_resumetext WHERE emp_resumetext.EmpID=?";

    mysqlConnection.query(sql,req.param("id"), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]); //NOTE Have to send the [0] row
            console.log(rows[0]);
            // res.render("Hello.ejs", {name:rows});
           
        } else {
            console.log(err);
        }
    });

})




// UPDATE
Router.post('/update', [
    // check('projectlocation', "Project Location cannot be empty.").notEmpty(),
    // check('degree', "Degree cannot be empty.").notEmpty(),
    // check('empid', "EmployeeID cannot be empty.").isInt({ min:1}),
    // check('empprojectrole', "Project role cannot be empty.").isInt({ min:1}),

    // check('degree', "Degree cannot be empty.").isInt({ min:1, max: 2000}),
    // check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
],
    function (req, res) {
         const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let post3 = req.body;

        let query = `UPDATE emp_resumetext  SET ? WHERE ID=?`;
        mysqlConnection.query(query, [post3, req.body.id], (err, rows, fields) => {
            if (!err) {
                res.send(rows);
                console.log(post3);
            } else {
                console.log("err");
            }
        });
    });




// INSERT
// Router.post('/', function (req, res) {
    // With express-Validator   
    Router.post('/',[ 
        // check('projectlocation', "Project Location cannot be empty.").notEmpty(),
        // check('empid', "EmployeeID cannot be empty.").isInt({ min:1}),
        // check('empprojectrole', "Project role cannot be empty.").isInt({ min:1}),
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
        await utils.maxid("emp_resumetext","ID")
        .then(data => {
            maxid = data;
        });


    req.body.id = maxid + 1;
    let postdata = req.body; 

    mysqlConnection.query('INSERT INTO emp_resumetext SET ?', postdata, function (error, results, fields) {
        if (!error) {
            console.log("success");
            res.send(results);
        } else {
            console.log(error);
        }
    });
});





// DELETE pro_address
Router.delete('/:empid', function (req, res) {
    mysqlConnection.query("DELETE FROM emp_resumetext WHERE EmpID=?", req.param('empid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});











// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/empdegree-angular-datatable/:empid', function (req, res) {
    Router.get('/proaddressdetails/:projectid', async (req, res) => { // sending empid in body now

    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
        mysqlConnection.query(

            // ID
            // AddressLine1
            // AddressLine2
            // ProjectLocation
            // City
            // State
            // Zipcode
            // Country
            // Notes
            // ProjectID
            
            `SELECT pro_address.ID, pro_address.AddressLine1, pro_address.AddressLine2, pro_address.ProjectLocation, pro_address.City,  pro_address.Zipcode,  pro_address.Notes, pro_address.ProjectID,
            list_state.str1 AS disState, list_country.Str1 AS disCountry  
            FROM  pro_address LEFT OUTER JOIN
            list_state ON pro_address.State = list_state.ListID LEFT OUTER JOIN
            list_country ON pro_address.Country = list_country.ListID 
            WHERE pro_address.ProjectID = ?`    ,  
    
    
         req.param('projectid'), (err, rows, fields) => {
            if (!err) {
                res.send(rows[0]);
                // res.render("Hello.ejs", {name:rows});
            } else {
                console.log(err);
            }
        });
    });










 



// // 2024 USING THIS (with count in same query for faster loading)
// // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
// // Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/search/angular-datatable', async function (req, res) {

    
//     let draw = req.body.draw;
//     let limit = req.body.length;
//     let offset = req.body.start;
//     // let ordercol = req.body['order[0][column]'];
//     let ordercol = req.body.order[0].column;//changed 20221130 for angular
//     // let orderdir =  req.body['order[0][dir]'];
//     let orderdir = req.body.order[0].dir;//changed 20221130 for angular
//     let search = req.body.search.value;
//     // let search = req.body['search[value]'];

//     let jobtitle = req.body.jobtitle;
//     let department = req.body.department;
//     let registration = req.body.registration;
//     let disciplinesf254 = req.body.disciplinesf254;
//     let disciplinesf330 = req.body.disciplinesf330;
//     let employeestatus = req.body.employeestatus;
//     let comid = req.body.comid;
//     let empdegree = req.body.empdegree;
//     let emptraining = req.body.emptraining;
//     let owner = req.body.owner;
//     let client = req.body.client;
//     let proocategory = req.body.proocategory;
//     let projecttype = req.body.projecttype;
//     let empprojectrole = req.body.empprojectrole;




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

//     //** This is needed for order by to work and exact field name should be used
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

//         //** This is needed for order by to work and exact field name should be used
//         0: 'EmployeeID',
//         1: 'Department',
//         2: 'JobTitle',
//         3: 'Registration',
//         4: 'HireDate',
//     }



//     var totalData = 0;
//     // var totalbeforefilter = 0;
//     var totalFiltered = 0;
//     var col = columns[ordercol];// to get name of order col not index

//     // // For Getting the TotalData without Filter
//     // let sql1 = `SELECT * FROM emp_main WHERE emp_main.EmpID>0`;
//     // mysqlConnection.query(sql1, (err, rows, fields) => {
//     //     totalData = rows.length;
//     //      // totalbeforefilter = rows.length; // disabled 2023
//     // });

// // ** After using pool conn the mysql order has changed. So to keep the order async await is used
// // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
// // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

// // await test().then(json => {console.log(json)});
// // await utils.totaldata("SELECT * FROM emp_main WHERE emp_main.EmpID>0").then(data => {totalData = data;});
// //    await utils.totaldata("SELECT COUNT(EmpID) AS total FROM emp_main WHERE emp_main.EmpID>0").then(data => {totalData = data;});
// // const value = await totaldata();

//     // let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
//     // list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
//     // emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
//     // INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0`
 
//     // var sqlWhere = '';

//     // let sql =
//     // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
//     //     list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
//     //     list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
//     //     emp_main.ExpWithOtherFirm, 
//     //     (select count(*) from emp_main ) as totaldata, 
//     //     (select count(*) from emp_main WHERE ${sqlWhere}) as totaldata, 
//     //     FROM emp_main LEFT OUTER JOIN
//     //     list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
//     //     list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
//     //     list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
//     //     list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
//     //     list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
//     //     list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
//     //     list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
//     //     list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
//     //     com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
//     //     emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
//     //     emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
//     //     pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
//     //     pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0`






//     // NOTE "mysqlConnection.escape" is used to avoid sql inj with dynamic generated query parameters 
//     // which is not possible with "?"
//     // if (firstname !== "") {
//     //     //sql = sql+ ` AND firstname = '%${firstname}%'`;
//     //      sql = sql+ " AND Firstname Like "+ mysqlConnection.escape("%"+firstname+"%");
//     //      filterpresent=true;
//     // }
//     // if (lastname !== "") {
//     //     // sql = sql+ ` AND lastname LIKE '%${lastname}%'`;
//     //     sql = sql+ " AND Lastname Like "+ mysqlConnection.escape("%"+lastname+"%");
//     //     filterpresent=true;
//     // }
//     // if (jobtitle > 0) {
//     //     // sql = sql+ ` AND jobtitle = '${jobtitle}'`;
//     //     sql = sql+ " AND JobTitle = "+ mysqlConnection.escape(jobtitle);
//     //     filterpresent=true;
//     // }
//     // if (registration > 0) {
//     //     // sql = sql+ ` AND registration = '${registration}'`;
//     //     sql = sql+ " AND Registration = "+ mysqlConnection.escape(registration);
//     //     filterpresent=true;
//     // }




//     var sqlWhere = '';
//     filterpresent=false;

//     if (jobtitle > 0) {
//         // sql = sql + ` AND emp_main.JobTitle = ${jobtitle}`
//         sqlWhere = sqlWhere + ` AND emp_main.JobTitle = ${jobtitle}`
//         filterpresent = true;
//     }
//     if (department > 0) {
//         sqlWhere = sqlWhere + ` AND emp_main.Department = ${department}`
//         filterpresent = true;
//     }
//     if (registration > 0) {
//         sqlWhere = sqlWhere + ` AND emp_main.Registration = ${registration}`
//         filterpresent = true;
//     }
//     if (disciplinesf254 > 0) {
//         sqlWhere = sqlWhere + ` AND emp_main.DisciplineSF254 = ${disciplinesf254}`
//         filterpresent = true;
//     }
//     if (disciplinesf330 > 0) {
//         sqlWhere = sqlWhere + ` AND emp_main.DisciplineSF330 = ${disciplinesf330}`
//         filterpresent = true;
//     }
//     if (employeestatus > 0) {
//         sqlWhere = sqlWhere + ` AND emp_main.EmployeeStatus = ${employeestatus}`
//         filterpresent = true;
//     }
//     if (comid > 0) {
//         sqlWhere = sqlWhere + ` AND emp_main.ComID = ${comid}`
//         filterpresent = true;
//     }


//     // Employee CHILD Multi Table search. Include inner joins here with where clause
//     if (empdegree > 0) {
//         sqlWhere = sqlWhere + ` AND emp_degree.Degree = ${empdegree}`
//         filterpresent = true;
//     }
//     if (emptraining > 0) {
//         sqlWhere = sqlWhere + ` AND emp_training.TrainingName = ${emptraining}`
//         filterpresent = true;
//     }

//     // PROJECT Related Multi Table search. 
//     if (projecttype > 0) {
//         sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
//         filterpresent = true;
//     }
//     if (projecttype > 0) {
//         sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
//         filterpresent = true;
//     }
//     if (projecttype > 0) {
//         sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
//         filterpresent = true;
//     }
//     if (projecttype > 0) {
//         sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
//         filterpresent = true;
//     }
//     if (owner > 0) {
//         sqlWhere = sqlWhere + ` AND pro_main.Owner = ${owner}`
//         filterpresent = true;
//     }
//     if (client > 0) {
//         sqlWhere = sqlWhere + ` AND pro_main.Client = ${client}`
//         filterpresent = true;
//     }
//     if (proocategory > 0) {
//         sqlWhere = sqlWhere + ` AND pro_main.OwnerCategory = ${proocategory}`
//         filterpresent = true;
//     }
//     if (empprojectrole > 0) {
//         sqlWhere = sqlWhere + ` AND pro_team.EmpProjectRole = ${empprojectrole}`
//         filterpresent = true;
//     }



//     // 2024 Avoid using multiple sql for speed
//     // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
    
// let from = ` FROM emp_main LEFT OUTER JOIN
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
//     pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0 `
    
//     // (select count(*) from emp_main WHERE emp_main.EmpID>0 ${sqlWhere}) as totalfiltered 

//     // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
//     // https://stackoverflow.com/questions/15710930/mysql-select-distinct-count
//     let sql =
//     `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
//         list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
//         list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
//         emp_main.ExpWithOtherFirm, 
//         (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
//         (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
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
//         pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0`



//     //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
//     // So total filtered record is calculated before applying limit and
//     // let totalbeforelimitandoffset=0;
//     // let sql3 = sql + ` order by ${col} ${orderdir} `;
//     // mysqlConnection.query(sql3, (err, rows3, fields) => {
//     //     totalbeforelimitandoffset = rows3.length;
//     //     // console.log("testtotal :: " +rows3.length);
//     // });

// // ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
// // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
// // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
//     // await utils.totalbeforelimtandoff(sql3).then(data => {totalbeforelimitandoffset = data;});



// if (search == "") {
//     // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

//     // 2024 edited for showing all records
//     if (limit == -1) {
//         sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
//     } else {
//         sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//     }
//     // sql = sql + ` order by ${col} ${orderdir} `;
//     mysqlConnection.query(sql, (err, rows, fields) => {
//         if (!err) {

//             if (!filterpresent) {
//                 //2023 important. if no filter is present totalFiltered remains totalData in table
//                 // totalFiltered = totalData;
//                 if (rows.length>0) {
//                     totalData = rows[0].totaldata;
//                 }
//                 totalFiltered = totalData;
//             }  
//             else {
//                 //2023 important. if filter is present then get totalFiltered value totalbeforelimitandoffset
//                 // before limit and offset is applied to sql string
//                 // totalFiltered = totalbeforelimitandoffset;
//                 // totalData = rows[0].totaldata;
//                 // totalFiltered = rows[0].totalfiltered;
//                 if (rows.length>0) {
//                     totalData = rows[0].totaldata;
//                 }
//                 if (rows.length>0) {
//                     totalFiltered = rows[0].totalfiltered;
//                 }
//             }
//             res.json({
//                 "draw": draw,
//                 "recordsTotal": totalData,
//                 "recordsFiltered": totalFiltered,
//                 "data": rows
//             });
//         }
//         else {
//             console.log(err);
//         }

//     });

// } else {

    
//     // console.log(sql);
//     // sql = sql + ` AND firstname LIKE '%${search}%'`;
//     // sql = sql + ` OR lastname LIKE '%${search}%'`;
//     // sql = sql + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
//     // sql = sql + ` OR list_empregistration.str1 LIKE '%${search}%'`;


//     // sql = sql + sqlWhere + ` AND Firstname LIKE '%${search}%'`;
//     // sql = sql + sqlWhere + ` OR Lastname LIKE '%${search}%'`;
//     // sql = sql + sqlWhere + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
//     // sql = sql + sqlWhere + ` OR list_empregistration.str1 LIKE '%${search}%'`;
//     // sql = sql + sqlWhere + ` OR list_department.Str1 LIKE '%${search}%'`;
//     // sql = sql + sqlWhere + ` OR emp_main.HireDate LIKE '%${search}%'`;
//     // sql = sql + sqlWhere + ` OR emp_main.EmployeeID LIKE '%${search}%'`;


//     // sqlWhere = sqlWhere + ` AND Firstname LIKE '%${search}%'`;
//     // sqlWhere = sqlWhere + ` OR Lastname LIKE '%${search}%'`;
//     sqlWhere = sqlWhere + ` AND emp_main.EmployeeID LIKE '%${search}%'`;        
//     sqlWhere = sqlWhere + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
//     sqlWhere = sqlWhere + ` OR list_empregistration.str1 LIKE '%${search}%'`;
//     sqlWhere = sqlWhere + ` OR list_department.Str1 LIKE '%${search}%'`;
//     sqlWhere = sqlWhere + ` OR emp_main.HireDate LIKE '%${search}%'`;
    


//     sql =
//     `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
//         list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
//         list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
//         emp_main.ExpWithOtherFirm, 
//         (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
//         (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
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
//         pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0`

 

//         if (limit == -1) {
//             sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
//         } else {
//             sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
//             console.log("stringsearch : " + sql);
//         }

//     // strsql = strsql + ` AND Emp_Main.EmployeeID LIKE '%${search}%'`;
//     // strsql = strsql + ` OR List_EmpJobTitle.str1 LIKE '%${search}%'`;
//     // // strsql = strsql + ` OR List_Department.str1 LIKE '%${search}%'`;
//     // strsql = strsql + ` OR List_EmpRegistration.str1 LIKE '%${search}%'`;
//     // // strsql = strsql + ` OR List_DisciplineSF254.str1 LIKE '%${search}%'`;
//     // // strsql = strsql + ` OR List_DisciplineSF330.str2 LIKE '%${search}%'`;


//     mysqlConnection.query(sql, (err, rows, fields) => {
//         if (!err) {
//             // totalFiltered = rows.length
//             // totalFiltered = rows[0].totalfiltered;
//             // totalData = rows[0].totaldata;
//             // totalFiltered = rows[0].totalfiltered;

//             if (rows.length>0) {
//                 totalData = rows[0].totaldata;
//             }
//             if (rows.length>0) {
//                 totalFiltered = rows[0].totalfiltered;
//             }
//             res.json({
//                 "draw": draw,
//                 "recordsTotal": totalData,
//                 "recordsFiltered": totalFiltered,
//                 "data": rows
//             });
//         }
//         else {
//             console.log(err);
//         }

//     });

// } // end else
// });



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

    // let jobtitle = req.body.jobtitle;
    // let department = req.body.department;
    // let registration = req.body.registration;
    // let disciplinesf254 = req.body.disciplinesf254;
    // let disciplinesf330 = req.body.disciplinesf330;
    // let employeestatus = req.body.employeestatus;
    // let comid = req.body.comid;
    // let empdegree = req.body.empdegree;
    // let emptraining = req.body.emptraining;
    // let owner = req.body.owner;
    // let client = req.body.client;
    // let proocategory = req.body.proocategory;
    // let projecttype = req.body.projecttype;
    // let empprojectrole = req.body.empprojectrole;


    let employeeid = req.body.employeeid;
    let registration = req.body.registration;
    let education = req.body.education;
    let affiliations = req.body.affiliations;
    let employment = req.body.employment;
    let experience = req.body.experience;
 

    //** This is needed for order by to work and exact field name should be used
    var columns = {

        //** This is needed for order by to work and exact field name should be used
        0: 'EmployeeID',
        1: 'Education',
        2: 'Registration',
        3: 'Affiliations',
        4: 'Employment',
        5: 'Experience',
    }



    var totalData = 0;
    // var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index


    var sqlWhere = '';
    filterpresent=false;

    // if (jobtitle > 0) {
    //     // sql = sql + ` AND emp_main.JobTitle = ${jobtitle}`
    //     sqlWhere = sqlWhere + ` AND emp_main.JobTitle = ${jobtitle}`
    //     filterpresent = true;
    // }
    // if (department > 0) {
    //     sqlWhere = sqlWhere + ` AND emp_main.Department = ${department}`
    //     filterpresent = true;
    // }

    // if (registration > 0) {
    if (employeeid != "") {
        sqlWhere = sqlWhere + ` AND emp_main.EmployeeID LIKE '%${employeeid}%' `;
        filterpresent = true;
    }
    if (registration != "") {
        // sqlWhere = sqlWhere + ` AND emp_main.Registration = ${registration}`
        sqlWhere = sqlWhere + ` AND emp_resumetext.Registration LIKE '%${registration}%' `;
        filterpresent = true;
    }
    if (education != "") {
        sqlWhere = sqlWhere + ` AND emp_resumetext.Education LIKE '%${education}%' `;
        filterpresent = true;
    }
    if (affiliations != "") {
        sqlWhere = sqlWhere + ` AND emp_resumetext.Affiliations LIKE '%${affiliations}%' `;
        filterpresent = true;
    }
    if (employment != "") {
        sqlWhere = sqlWhere + ` AND emp_resumetext.Employment LIKE '%${employment}%' `;
        filterpresent = true;
    }
    if (experience != "") {
        sqlWhere = sqlWhere + ` AND emp_resumetext.Experience LIKE '%${experience}%' `;
        filterpresent = true;
    }

    // if (disciplinesf254 > 0) {
    //     sqlWhere = sqlWhere + ` AND emp_main.DisciplineSF254 = ${disciplinesf254}`
    //     filterpresent = true;
    // }
    // if (disciplinesf330 > 0) {
    //     sqlWhere = sqlWhere + ` AND emp_main.DisciplineSF330 = ${disciplinesf330}`
    //     filterpresent = true;
    // }
    // if (employeestatus > 0) {
    //     sqlWhere = sqlWhere + ` AND emp_main.EmployeeStatus = ${employeestatus}`
    //     filterpresent = true;
    // }
    // if (comid > 0) {
    //     sqlWhere = sqlWhere + ` AND emp_main.ComID = ${comid}`
    //     filterpresent = true;
    // }


    // // Employee CHILD Multi Table search. Include inner joins here with where clause
    // if (empdegree > 0) {
    //     sqlWhere = sqlWhere + ` AND emp_degree.Degree = ${empdegree}`
    //     filterpresent = true;
    // }
    // if (emptraining > 0) {
    //     sqlWhere = sqlWhere + ` AND emp_training.TrainingName = ${emptraining}`
    //     filterpresent = true;
    // }

    // // PROJECT Related Multi Table search. 
    // if (projecttype > 0) {
    //     sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
    //     filterpresent = true;
    // }
    // if (projecttype > 0) {
    //     sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
    //     filterpresent = true;
    // }
    // if (projecttype > 0) {
    //     sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
    //     filterpresent = true;
    // }
    // if (projecttype > 0) {
    //     sqlWhere = sqlWhere + ` AND pro_main.PrimaryProjectType = ${projecttype}`
    //     filterpresent = true;
    // }
    // if (owner > 0) {
    //     sqlWhere = sqlWhere + ` AND pro_main.Owner = ${owner}`
    //     filterpresent = true;
    // }
    // if (client > 0) {
    //     sqlWhere = sqlWhere + ` AND pro_main.Client = ${client}`
    //     filterpresent = true;
    // }
    // if (proocategory > 0) {
    //     sqlWhere = sqlWhere + ` AND pro_main.OwnerCategory = ${proocategory}`
    //     filterpresent = true;
    // }
    // if (empprojectrole > 0) {
    //     sqlWhere = sqlWhere + ` AND pro_team.EmpProjectRole = ${empprojectrole}`
    //     filterpresent = true;
    // }



    // 2024 Avoid using multiple sql for speed
    // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
    
let from = 
// ` FROM emp_main LEFT OUTER JOIN
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
//     pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0 `

` FROM emp_main LEFT OUTER JOIN emp_resumetext ON emp_main.EmpID = emp_resumetext.EmpID WHERE emp_main.EmpID>0 `

    
    // (select count(*) from emp_main WHERE emp_main.EmpID>0 ${sqlWhere}) as totalfiltered 

    // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
    // https://stackoverflow.com/questions/15710930/mysql-select-distinct-count
    let sql =
    // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
    //     list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
    //     list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
    //     emp_main.ExpWithOtherFirm, 
    //     (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
    //     (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
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
    //     pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0 `

    `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_resumetext.Education,emp_resumetext.Registration, 
    emp_resumetext.Affiliations, emp_resumetext.Employment, emp_resumetext.Experience, 
    (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
    (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
    FROM emp_main LEFT OUTER JOIN emp_resumetext ON emp_main.EmpID = emp_resumetext.EmpID WHERE emp_main.EmpID>0 `



if (search == "") {
    // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

    // 2024 edited for showing all records
    if (limit == -1) {
        sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
    } else {
        sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
    }

    // console.log(sql)
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


    // // sqlWhere = sqlWhere + ` AND Firstname LIKE '%${search}%'`;
    // // sqlWhere = sqlWhere + ` OR Lastname LIKE '%${search}%'`;
    // sqlWhere = sqlWhere + ` AND emp_main.EmployeeID LIKE '%${search}%'`;        
    // sqlWhere = sqlWhere + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
    // sqlWhere = sqlWhere + ` OR list_empregistration.str1 LIKE '%${search}%'`;
    // sqlWhere = sqlWhere + ` OR list_department.Str1 LIKE '%${search}%'`;
    // sqlWhere = sqlWhere + ` OR emp_main.HireDate LIKE '%${search}%'`;

    sqlWhere = sqlWhere + ` AND emp_main.EmployeeID LIKE '%${search}%'`; 
    sqlWhere = sqlWhere + ` OR emp_resumetext.Education LIKE '%${search}%'`;        
    sqlWhere = sqlWhere + ` OR emp_resumetext.Registration LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR emp_resumetext.Affiliations LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR emp_resumetext.Employment LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR emp_resumetext.Experience LIKE '%${search}%'`;


    sql =
    // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
    //     list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
    //     list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
    //     emp_main.ExpWithOtherFirm, 
    //     (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
    //     (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
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

 

        `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_resumetext.Education,emp_resumetext.Registration, 
        emp_resumetext.Affiliations,emp_resumetext.Experience, emp_resumetext.Employment,
        (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
        (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
        FROM emp_main LEFT OUTER JOIN emp_resumetext ON emp_main.EmpID = emp_resumetext.EmpID WHERE emp_main.EmpID>0 `


        if (limit == -1) {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
        } else {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
            console.log("stringsearch : " + sql);
        }


    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
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
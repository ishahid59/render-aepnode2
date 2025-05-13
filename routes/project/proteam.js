const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const utils = require('../utils');

// var utils = require("./utils");




//************************************************************** */
// AUTHENTICATION FOR INDIVIDUAL ROUTES can be used
//************************************************************** */

// Router.use(authenticateToken); 




Router.get('/maxproteamid', function (req, res) {
    // console.log("from maxempid"); 
    mysqlConnection.query("SELECT MAX(ID) as maxproteamid FROM  pro_team", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
        // res.send(result[0].empid);
    });

});

// Used To check for duplicateemployeeid()
Router.get('/duplicateemployeeid/:empid/:projectid', function (req, res) {
    // console.log("from maxempid"); 
    // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT *  FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmployeeID=?", req.param('empid'), (err, rows) => {
        // SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total
        var filter = [req.param('empid'), req.param('projectid')];
        // mysqlConnection.query("SELECT COUNT(*) AS employeeidcount FROM pro_team  WHERE pro_team.EmpID=?", req.param('empid'), (err, rows) => {
        mysqlConnection.query("SELECT COUNT(*) AS employeeidcount FROM pro_team  WHERE pro_team.EmpID=? and pro_team.ProjectID=? " , filter, (err, rows, fields) => {

        if (err) {
            console.log(err)
        }
        res.send(rows);//note: cannot get result[0].employeeidcount here. But can get value in angular from 'rows'
        // res.send(result[0].empid);
        // console.log("from maxempid"); 
    });

});


// EDIT GET
Router.get('/:id',  (req, res) => {
    // let sql = "SELECT emp_degree.id, emp_degree.degree as str1,emp_degree.empid FROM emp_degree WHERE emp_degree.empid=? ORDER BY emp_degree.id";
    //    let x= getmaxid(5,5);
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmpID=?", req.param('empid'), (err, rows, fields) => {

    let sql = "SELECT * FROM pro_team WHERE pro_team.ID=?";

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
    // check('degree', "Degree cannot be empty.").notEmpty(),
    check('empid', "EmployeeID cannot be empty.").isInt({ min:1}),
    check('empprojectrole', "Project role cannot be empty.").isInt({ min:1}),

    // check('degree', "Degree cannot be empty.").isInt({ min:1, max: 2000}),
    // check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
],
    function (req, res) {
         const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let post3 = req.body;

        let query = `UPDATE pro_team  SET ? WHERE ID=?`;
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
Router.post('/', [
    check('empid', "EmployeeID cannot be empty.").isInt({ min: 1 }),
    check('empprojectrole', "Project role cannot be empty.").isInt({ min: 1 }),
],
    async function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }



        // Duplicate item check
        // **********************************************************************
        var duplicateitemfound = false;
        // var sql = `SELECT COUNT(*) AS employeeidcount FROM pro_team  WHERE pro_team.EmpID=${req.body.empid} and pro_team.ProjectID=${req.body.projectid}`
        var sql = `SELECT EmpID FROM pro_team  WHERE pro_team.EmpID=${req.body.empid} and pro_team.ProjectID=${req.body.projectid}`

        await utils.duplicateitemcheck(sql)
            .then(data => {
                duplicateitemfound = data;
            });
        if (duplicateitemfound == true) {
            res.send({ "duplicateitemfound": true });
            console.log("data " + duplicateitemfound)
            return;
        }


        

        // EMPTY DATE CHECK, Should be done in server side
        //***************************************************************************** */
        // *** 2023 Note If date is cleared the it always has a value of '' which tries to save 0000-00-00 00:00:00 in mysql server resulting err;
        // Can also handle in front end
        if (req.body.durationfrom === '') {//0000-00-00 00:00:00
            req.body.durationfrom = null;
        }
        if (req.body.durationto === '') {//0000-00-00 00:00:00
            req.body.durationto = null;
        }




        // Get Maxid
        // **********************************************************************
        var maxid = 0;
        // when query result from a function is called  it doesnt return a value.  So promise is used
        // we needed async function for execution sequence, and async function returns promise not any plain value. so Promise is used
        // await utils.maxid("SELECT COUNT(ID) AS total FROM emp_registration WHERE emp_registration.EmpID="+ req.body.empid)
        await utils.maxid("pro_team", "ID")
            .then(data => {
                maxid = data;
            });
        req.body.id = maxid + 1;




        let postdata = req.body;
        mysqlConnection.query('INSERT INTO pro_team SET ?', postdata, function (error, results, fields) {
            if (!error) {
                console.log("success");
                res.send(results);
            } else {
                console.log(error);
            }
        });
    });





// DELETE pro team
Router.delete('/:proteamid', function (req, res) {
    mysqlConnection.query("DELETE FROM pro_team WHERE ID=?", req.param('proteamid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});





// DETAIL PAGE used in ANGULAR 2022 to get jobtitle name instead of id
Router.get('/proteamdetails/:id', async (req, res) => {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
    mysqlConnection.query(

        // `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
        // list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
        // emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
        // INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid=?`

        // `SELECT  pro_main.ProjectName, pro_main.ProjectNo,  list_empprojectrole.Str1 AS disEmpProjectRole, 
        // List_EmpProjectRole_1.Str1 AS disSecProjectRole, pro_team.ID, pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, 
        // pro_team.MonthsOfExp, pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID, pro_team.ProjectID, pro_team.Notes
        // FROM pro_main INNER JOIN
        // pro_team ON pro_main.ProjectID = pro_team.ProjectID INNER JOIN
        // list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN
        // list_empprojectrole AS List_EmpProjectRole_1 ON pro_team.SecProjectRole = List_EmpProjectRole_1.ListID
        // WHERE pro_team.ID = ?` ,   
        
        `SELECT emp_main.EmployeeID AS disEmployeeID, list_empprojectrole.Str1 AS disEmpProjectRole, list_empprojectrole_1.Str1 AS disSecProjectRole, pro_team.ID, \
        pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, pro_team.MonthsOfExp, pro_team.Notes, pro_team.ProjectID, \ 
        pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID \
        FROM pro_team INNER JOIN \
        emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
        list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
        list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
        WHERE pro_team.ID = ?`  ,  
        
        
// WHERE pro_team.ProjectID = ?`
     req.param('id'), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});
















// used with angular 20221130 with angular-datatable for emp degree
// Search Datatable severside code
// *******************************************************************************************************
    
// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/empdegree-angular-datatable/:empid', function (req, res) {
    Router.post('/proteam-angular-datatable', async function (req, res) { // sending empid in body now
        
        // console.log(req.body);
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
      
    
        // to get the column name from index since dtable sends col index
        //** This is needed for order by to work and exact field name should be used
        var columns = {
            // 0: 'EmployeeID',
            // 1: 'EmpProjectRole',
            // 3:'SecProjectRole',
            // 4:'DurationFrom',
            // 5:'DurationTo',
            // 5:'MonthsOfExp',

            0: 'ProjectID',
            1: 'disEmployeeID',  
            2: 'DutiesAndResponsibilities',
            3: 'EmpProjectRole',
            4:'SecProjectRole', 
            5:'DurationFrom',
            6:'DurationTo',
            7:'MonthsOfExp',
            8:'Notes',
         }
    
        var totalData = 0;
        var totalbeforefilter = 0;
        var totalFiltered = 0;
        var col = columns[ordercol];// to get name of order col not index
    
        // For Getting the TotalData without Filter
        // let sql1 = `SELECT * FROM pro_team WHERE pro_team.id>0`;
        //**2023 Chils table queries for total before filter should be like this */
        // let sql1 = `SELECT * FROM pro_team WHERE pro_team.ProjectID=`+ req.body.projectid + ``;//2023
        // mysqlConnection.query(sql1, (err, rows, fields) => {
        //     totalData = rows.length;
        //     totalbeforefilter = rows.length;
        // });


    // ** After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

    await utils.totaldata("SELECT COUNT(ID) AS total FROM pro_team WHERE pro_team.ProjectID="+ req.body.projectid)
        .then(data => {
            totalData = data;
        });
    // const value = await totaldata();



    
        let sql = 

        `SELECT emp_main.EmployeeID AS disEmployeeID, list_empprojectrole.Str1 AS disEmpProjectRole, list_empprojectrole_1.Str1 AS disSecProjectRole, pro_team.ID, \
            pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, pro_team.MonthsOfExp, pro_team.Notes, pro_team.ProjectID, \ 
            pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID \
            FROM pro_team INNER JOIN \
            emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
            list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
            list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
            WHERE (pro_team.ProjectID = `+ req.body.projectid + `)`


        if (search == "") {
            // console.log("No Search");
            sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
            // console.log("mysql "+sql);
            mysqlConnection.query(sql, (err, rows, fields) => {
                
                if (!err) {
                    // totalFiltered = rows.length; //totalbeforefilter
                    totalFiltered = totalData; //totalbeforefilter
                    res.json({
                        "draw": draw,
                        "recordsTotal": totalData, //totalData,
                        "recordsFiltered": totalFiltered,
                        "data": rows
                    });
                }
                else {
                    console.log(err);
                }

                // if (!err) {

                //     if (!filterpresent) {
                //         totalFiltered = totalbeforefilter;
                //     }
                //     else{
                //         totalFiltered = rows.length;
                //     }
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

            });
    
        } else {
            // console.log(sql);
            sql = sql + ` AND list_empprojectrole.Str1 LIKE '%${search}%'`;

            // //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
            // So total filtered record is calculated before applying limit and
            let totalbeforelimitandoffset = 0;
            let sql3 = sql + ` order by ${col} ${orderdir} `;
            mysqlConnection.query(sql3, (err, rows3, fields) => {
                totalbeforelimitandoffset = rows3.length;
                // console.log("testtotal :: " + sql3);
            });
    
            mysqlConnection.query(sql, (err, rows, fields) => {
                if (!err) {
                    // totalFiltered = rows.length
                    totalFiltered = totalbeforelimitandoffset
                    res.json({
                        "draw": draw,
                        "recordsTotal": totalData, //totalData,
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
    





// 2025 this is for emp-projects. Using everything from team with a little change in datatable query

// used with angular 20221130 with angular-datatable for emp degree
// Search Datatable severside code
// *******************************************************************************************************
    
// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/empdegree-angular-datatable/:empid', function (req, res) {
    Router.post('/proteam-angular-datatable-newempprojects', async function (req, res) { // sending empid in body now
        
        // console.log(req.body);
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
      
    
        // to get the column name from index since dtable sends col index
        //** This is needed for order by to work and exact field name should be used
        var columns = {
            0: 'disProjectNo',
            1: 'disEmployeeID',  
            2: 'DutiesAndResponsibilities',
            3: 'EmpProjectRole',
            4:'SecProjectRole', 
            5:'DurationFrom',
            6:'DurationTo',
            7:'MonthsOfExp',
            8:'Notes',
         }
    
        var totalData = 0;
        var totalbeforefilter = 0;
        var totalFiltered = 0;
        var col = columns[ordercol];// to get name of order col not index
    
        // For Getting the TotalData without Filter
        // let sql1 = `SELECT * FROM pro_team WHERE pro_team.id>0`;
        //**2023 Chils table queries for total before filter should be like this */
        // let sql1 = `SELECT * FROM pro_team WHERE pro_team.ProjectID=`+ req.body.projectid + ``;//2023
        // mysqlConnection.query(sql1, (err, rows, fields) => {
        //     totalData = rows.length;
        //     totalbeforefilter = rows.length;
        // });


    // ** After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

    // await utils.totaldata("SELECT COUNT(ID) AS total FROM pro_team WHERE pro_team.ProjectID="+ req.body.projectid)
    await utils.totaldata("SELECT COUNT(ID) AS total FROM pro_team WHERE pro_team.EmpID="+ req.body.empid)
    .then(data => {
            totalData = data;
        });
    // const value = await totaldata();



    
        let sql = 

        // `SELECT emp_main.EmployeeID AS disEmployeeID, list_empprojectrole.Str1 AS disEmpProjectRole, list_empprojectrole_1.Str1 AS disSecProjectRole, pro_team.ID, \
        //     pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, pro_team.MonthsOfExp, pro_team.Notes, pro_team.ProjectID, \ 
        //     pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID \
        //     FROM pro_team INNER JOIN \
        //     emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
        //     list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
        //     list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
        //     WHERE (pro_team.EmpID = `+ req.body.empid + `)`


        // 2025 this is for emp-projects
        `SELECT emp_main.EmployeeID AS disEmployeeID, pro_main.ProjectNo AS disProjectNo, list_empprojectrole.Str1 AS disEmpProjectRole, list_empprojectrole_1.Str1 AS disSecProjectRole, pro_team.ID, \
            pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, pro_team.MonthsOfExp, pro_team.Notes, pro_team.ProjectID, \ 
            pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID \
            FROM pro_team INNER JOIN \
            emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
            pro_main ON pro_team.ProjectID = pro_main.ProjectID INNER JOIN \
            list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
            list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
            WHERE (pro_team.EmpID = `+ req.body.empid + `)`


        if (search == "") {
            // console.log("No Search");
            sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
            // console.log("mysql "+sql);
            mysqlConnection.query(sql, (err, rows, fields) => {
                
                if (!err) {
                    // totalFiltered = rows.length; //totalbeforefilter
                    totalFiltered = totalData; //totalbeforefilter
                    res.json({
                        "draw": draw,
                        "recordsTotal": totalData, //totalData,
                        "recordsFiltered": totalFiltered,
                        "data": rows
                    });
                }
                else {
                    console.log(err);
                }

                // if (!err) {

                //     if (!filterpresent) {
                //         totalFiltered = totalbeforefilter;
                //     }
                //     else{
                //         totalFiltered = rows.length;
                //     }
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

            });
    
        } else {
            // console.log(sql);
            sql = sql + ` AND list_empprojectrole.Str1 LIKE '%${search}%'`;

            // //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
            // So total filtered record is calculated before applying limit and
            let totalbeforelimitandoffset = 0;
            let sql3 = sql + ` order by ${col} ${orderdir} `;
            mysqlConnection.query(sql3, (err, rows3, fields) => {
                totalbeforelimitandoffset = rows3.length;
                // console.log("testtotal :: " + sql3);
            });
    
            mysqlConnection.query(sql, (err, rows, fields) => {
                if (!err) {
                    // totalFiltered = rows.length
                    totalFiltered = totalbeforelimitandoffset
                    res.json({
                        "draw": draw,
                        "recordsTotal": totalData, //totalData,
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






//*******************************************************************************************************
// empresumeprojectssearch 2025
// **************************************************************************************************** */


Router.post('/proteam-angular-datatable-empresumeprojectssearch', async function (req, res) {
    
    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    // let ordercol = req.body['order[0][column]'];
    let ordercol = req.body.order[0].column;//changed 20221130 for angular
    // let orderdir =  req.body['order[0][dir]'];
    let orderdir = req.body.order[0].dir;//changed 20221130 for angular
    let search = req.body.search.value;
    // let search = req.body['search[value]'];


    let empid = req.body.empid;
    let projectid = req.body.projectid;
    let employeeid = req.body.employeeid;
    let dutiesandresponsibilities = req.body.dutiesandresponsibilities;
    let empprojectrole = req.body.empprojectrole;
    let secprojectrole = req.body.secprojectrole;
    let durationfrom = req.body.durationfrom;
    let durationto = req.body.durationto;
    let monthsofexp = req.body.monthsofexp;
    let notes = req.body.notes;



    // to get the column name from index since dtable sends col index
    //** This is needed for order by to work and exact field name should be used
    var columns = {
        0: 'disProjectNo',
        1: 'disEmployeeID',  
        2: 'DutiesAndResponsibilities',
        3: 'EmpProjectRole',
        4:'SecProjectRole', 
        5:'DurationFrom',
        6:'DurationTo',
        7:'MonthsOfExp',
        8:'Notes',
     }



    var totalData = 0;
    // var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index


    var sqlWhere = '';
    filterpresent=false;


    if (empid > 0) {
        // sql = sql + ` AND emp_main.JobTitle = ${jobtitle}`
        sqlWhere = sqlWhere + ` AND pro_team.EmpID = ${empid}`
        filterpresent = true;
    }
    if (projectid > 0) {
        // sql = sql + ` AND emp_main.JobTitle = ${jobtitle}`
        sqlWhere = sqlWhere + ` AND pro_team.ProjectID = ${projectid}`
        filterpresent = true;
    }
    if (dutiesandresponsibilities != "") {
        sqlWhere = sqlWhere + ` AND pro_team.DutiesAndResponsibilities LIKE '%${dutiesandresponsibilities}%' `;
        filterpresent = true;
    }
    if (empprojectrole != "") {
        sqlWhere = sqlWhere + ` AND list_empprojectrole.Str1 LIKE '%${empprojectrole}%' `;
        filterpresent = true;
    }
    if (durationfrom != "") {
        sqlWhere = sqlWhere + ` AND pro_team.DurationFrom LIKE '%${durationfrom}%' `;
        filterpresent = true;
    }
    if (durationto != "") {
        sqlWhere = sqlWhere + ` AND pro_team.DurationTo LIKE '%${durationto}%' `;
        filterpresent = true;
    }
    if (monthsofexp != "") {
        sqlWhere = sqlWhere + ` AND pro_team.MonthsOfExp LIKE '%${monthsofexp}%' `;
        filterpresent = true;
    }
    if (notes != "") {
        sqlWhere = sqlWhere + ` AND pro_team.Notes LIKE '%${notes}%' `;
        filterpresent = true;
    }

    



    // 2024 Avoid using multiple sql for speed
    // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
    
let from = 

// old from empresumetext ` FROM emp_main LEFT OUTER JOIN emp_resumetext ON emp_main.EmpID = emp_resumetext.EmpID WHERE emp_main.EmpID>0 `

` FROM pro_team INNER JOIN \
        emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
        pro_main ON pro_team.ProjectID = pro_main.ProjectID INNER JOIN \
        list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
        list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
        WHERE pro_team.EmpID >0 ` 


    // (select count(*) from emp_main WHERE emp_main.EmpID>0 ${sqlWhere}) as totalfiltered 

    // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
    // https://stackoverflow.com/questions/15710930/mysql-select-distinct-count
   
    let sql =
  
    // old from empresumetext
    // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_resumetext.Education,emp_resumetext.Registration, 
    // emp_resumetext.Affiliations, emp_resumetext.Employment, emp_resumetext.Experience, 
    // (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
    // (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
    // FROM emp_main LEFT OUTER JOIN emp_resumetext ON emp_main.EmpID = emp_resumetext.EmpID WHERE emp_main.EmpID>0 `


    // ** Note "DISTINCT" is removed from sql  "count(DISTINCT pro_team.EmpID)" since many projects for 1 emp may exists, else will show 1 record for totalfiltered
    ` SELECT emp_main.EmployeeID AS disEmployeeID, pro_main.ProjectNo AS disProjectNo, list_empprojectrole.Str1 AS disEmpProjectRole, list_empprojectrole_1.Str1 AS disSecProjectRole, pro_team.ID, \
    pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, pro_team.MonthsOfExp, pro_team.Notes, pro_team.ProjectID, \ 
    pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID, \
    (select count(*) from pro_team WHERE pro_team.EmpID>0) as totaldata, 
    (select count(pro_team.EmpID) ${from} ${sqlWhere}) as totalfiltered 
    FROM pro_team INNER JOIN \
    emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
    pro_main ON pro_team.ProjectID = pro_main.ProjectID INNER JOIN \
    list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
    list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
    WHERE pro_team.EmpID >0 `

    // ` SELECT emp_main.EmployeeID AS disEmployeeID, pro_main.ProjectNo AS disProjectNo, list_empprojectrole.Str1 AS disEmpProjectRole, list_empprojectrole_1.Str1 AS disSecProjectRole, pro_team.ID, \
    // pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, pro_team.MonthsOfExp, pro_team.Notes, pro_team.ProjectID, \ 
    // pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID \
    // FROM pro_team INNER JOIN \
    // emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
    // pro_main ON pro_team.ProjectID = pro_main.ProjectID INNER JOIN \
    // list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
    // list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
    // WHERE (pro_team.EmpID = 2) `

  
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

    // sqlWhere = sqlWhere + ` AND disProjectID LIKE '%${search}%'`; 
    // sqlWhere = sqlWhere + ` OR disEmployeeID LIKE '%${search}%'`; 
    sqlWhere = sqlWhere + ` AND pro_team.ProjectID LIKE '%${search}%'`; 
    sqlWhere = sqlWhere + ` OR pro_team.EmpID LIKE '%${search}%'`; 
    
    sqlWhere = sqlWhere + ` OR pro_team.DutiesAndResponsibilities LIKE '%${search}%'`;        
    sqlWhere = sqlWhere + ` OR list_empprojectrole.Str1 LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR list_empprojectrole_1.Str1 LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR pro_team.DurationFrom LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR pro_team.DurationTo LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR pro_team.MonthsOfExp LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR pro_team.Notes LIKE '%${search}%'`;

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

 

        // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_resumetext.Education,emp_resumetext.Registration, 
        // emp_resumetext.Affiliations,emp_resumetext.Experience, emp_resumetext.Employment,
        // (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
        // (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
        // FROM emp_main LEFT OUTER JOIN emp_resumetext ON emp_main.EmpID = emp_resumetext.EmpID WHERE emp_main.EmpID>0 `
   
   
        // ** Note "DISTINCT" is removed from sql  "count(DISTINCT pro_team.EmpID)" since many projects for 1 emp may exists
        ` SELECT emp_main.EmployeeID AS disEmployeeID, pro_main.ProjectNo AS disProjectNo, list_empprojectrole.Str1 AS disEmpProjectRole, list_empprojectrole_1.Str1 AS disSecProjectRole, pro_team.ID, \
        pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, pro_team.MonthsOfExp, pro_team.Notes, pro_team.ProjectID, \ 
        pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID, \
        (select count(*) from pro_team WHERE pro_team.EmpID>0) as totaldata, 
        (select count(pro_team.EmpID) ${from} ${sqlWhere}) as totalfiltered 
        FROM pro_team INNER JOIN \
        emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
        pro_main ON pro_team.ProjectID = pro_main.ProjectID INNER JOIN \
        list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
        list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
        WHERE pro_team.EmpID >0 `
 
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
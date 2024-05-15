
const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const utils = require('../utils');






// Router.get('/:empid', async (req, res) => {
//     try {
//         let empid = req.param("empid");
//         let strsql=
//             `SELECT  pro_main.ProjectName, pro_main.ProjectNo,  list_empprojectrole.Str1 AS disEmpProjectRole, 
//             List_EmpProjectRole_1.Str1 AS disSecProjectRole, pro_team.ID, pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, 
//             pro_team.MonthsOfExp, pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID, pro_team.ProjectID, pro_team.Notes
//             FROM pro_main INNER JOIN
//             pro_team ON pro_main.ProjectID = pro_team.ProjectID INNER JOIN
//             list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN
//             list_empprojectrole AS List_EmpProjectRole_1 ON pro_team.SecProjectRole = List_EmpProjectRole_1.ListID
//             WHERE  (pro_team.EmpID = ${empid})
//             ORDER BY pro_main.ProjectNo DESC`

        
//         let pool = await sql.connect(mssqlconfig)
//         //let pool = await poolPromise
//         let result = await pool.request()
//             // .query(`SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=${empid}`)
//             .query(strsql);
//             res.send(result.recordset);
//     } catch (err) {
//         return res.status(400).send("MSSQL ERROR: " + err);
//     }
// })






// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/empdegree-angular-datatable/:empid', function (req, res) {
Router.post('/empprojects-angular-datatable', async function (req, res) { // sending empid in body now

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
    var columns = {
        // 0: 'ProjectID',
        // 1: 'ProjectNo',
        // 3: 'ProjectName',
        // 4: 'EmpProjectRole',
        // 5: 'SecProjectRole',
        // 6: 'DutiesAndResponsibilities',
        // 7: 'DurationFrom',
        // 8: 'DurationTo',
        // 9: 'MonthsOfExp',
        // 10: 'Notes',
        // 11: 'EmpID',


        0: 'ProjectNo',
        1: 'ProjectName',
        2: 'EmpProjectRole',
        3: 'DurationFrom',
        4: 'DurationTo',
        5: 'MonthsOfExp',
    }



    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index

    // For Getting the TotalData without Filter
    // let sql1 = `SELECT * FROM pro_team WHERE pro_team.id>0`;
    //**2023 Chils table queries for total before filter should be like this */
    // let sql1 = `SELECT * FROM pro_team WHERE pro_team.EmpID=`+ req.body.empid + ``;//2023

    // mysqlConnection.query(sql1, (err, rows, fields) => {
    //     totalData = rows.length;
    //     totalbeforefilter = rows.length;
    // });



    // ** After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

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
        //     WHERE (pro_team.ProjectID = `+ req.body.projectid + `)`

        `SELECT  pro_main.ProjectName, pro_main.ProjectNo,  list_empprojectrole.Str1 AS disEmpProjectRole, 
        List_EmpProjectRole_1.Str1 AS disSecProjectRole, pro_team.ID, pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, 
        pro_team.MonthsOfExp, pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID, pro_team.ProjectID, pro_team.Notes
        FROM pro_main INNER JOIN
        pro_team ON pro_main.ProjectID = pro_team.ProjectID INNER JOIN
        list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN
        list_empprojectrole AS List_EmpProjectRole_1 ON pro_team.SecProjectRole = List_EmpProjectRole_1.ListID
        WHERE  (pro_team.EmpID = ${req.body.empid})`
     
 


    // //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
    // // So total filtered record is calculated before applying limit and
    // let totalbeforelimitandoffset = 0;
    // let sql3 = sql + ` order by ${col} ${orderdir} `;
    // mysqlConnection.query(sql3, (err, rows3, fields) => {
    //     totalData = rows.length;
    //     totalbeforelimitandoffset = rows3.length;
    //     // console.log("testtotal :: " + rows3.length);
    // });







    // // console.log("No Search");
    // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
    // console.log("mysql " + sql);
    // mysqlConnection.query(sql, (err, rows, fields) => {

    //     if (!err) {
    //         // totalFiltered = rows.length; //totalbeforefilter
    //         totalFiltered = totalbeforelimitandoffset;
    //         res.json({
    //             "draw": draw,
    //             "recordsTotal": totalFiltered, //totalData,
    //             "recordsFiltered": totalFiltered,
    //             "data": rows
    //         });
    //     }
    //     else {
    //         console.log(err);
    //     }



    // });




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










    // end else
});











// Router.get('/empprojectsdetails/:id', async (req, res) => {
//     try {
//         let id = req.param("id");
//         let strsql=
//             `SELECT  pro_main.ProjectName, pro_main.ProjectNo,  list_empprojectrole.Str1 AS disEmpProjectRole, 
//             List_EmpProjectRole_1.Str1 AS disSecProjectRole, pro_team.ID, pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, 
//             pro_team.MonthsOfExp, pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID, pro_team.ProjectID, pro_team.Notes
//             FROM pro_main INNER JOIN
//             pro_team ON pro_main.ProjectID = pro_team.ProjectID INNER JOIN
//             list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN
//             list_empprojectrole AS List_EmpProjectRole_1 ON pro_team.SecProjectRole = List_EmpProjectRole_1.ListID
//             WHERE  (pro_team.ID = ${id})`
        
//         let pool = await sql.connect(mssqlconfig)
//         //let pool = await poolPromise
//         let result = await pool.request()
//             // .query(`SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=${empid}`)
//             .query(strsql);
//             res.send(result.recordset[0]);
//     } catch (err) {
//         return res.status(400).send("MSSQL ERROR: " + err);
//     }
// })




// DETAIL PAGE used in ANGULAR 2022 to get jobtitle name instead of id
Router.get('/empprojectsdetails/:id', async (req, res) => {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
 
  
    mysqlConnection.query(

        // `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
        // list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
        // emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
        // INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid=?`

        `SELECT  pro_main.ProjectName, pro_main.ProjectNo,  list_empprojectrole.Str1 AS disEmpProjectRole, 
        List_EmpProjectRole_1.Str1 AS disSecProjectRole, pro_team.ID, pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, 
        pro_team.MonthsOfExp, pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID, pro_team.ProjectID, pro_team.Notes
        FROM pro_main INNER JOIN
        pro_team ON pro_main.ProjectID = pro_team.ProjectID INNER JOIN
        list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN
        list_empprojectrole AS List_EmpProjectRole_1 ON pro_team.SecProjectRole = List_EmpProjectRole_1.ListID
        WHERE pro_team.ID = ?`    ,

     req.param('id'), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});









module.exports = Router;
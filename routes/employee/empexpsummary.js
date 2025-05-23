const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const utils = require('../utils');







 
//not using now using from util
Router.get('/maxprophotoid', function (req, res) {
    // console.log("from maxempid"); 
    mysqlConnection.query("SELECT MAX(ID) as maxprophotoid FROM  pro_photo", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
        // res.send(result[0].empid);
    });

});



    // Used To check for duplicateemployeeid()
    Router.get('/duplicateitemid/:itemid/:empid', function (req, res) {
        // console.log("from maxempid"); 
        // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
        // mysqlConnection.query("SELECT *  FROM  emp_main", (err, result) => {
        // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmployeeID=?", req.param('empid'), (err, rows) => {
            // SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total
            var filter = [req.param('itemid'), req.param('empid')];
            // mysqlConnection.query("SELECT COUNT(*) AS employeeidcount FROM pro_team  WHERE pro_team.EmpID=?", req.param('empid'), (err, rows) => {
            mysqlConnection.query("SELECT COUNT(*) AS itemidcount FROM emp_expsummary  WHERE emp_expsummary.ItemName=? and emp_expsummary.EmpID=? " , filter, (err, rows, fields) => {
    
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

    let sql = "SELECT * FROM emp_expsummary WHERE emp_expsummary.ID=?";

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




// DETAIL PAGE used in ANGULAR 2022 to get jobtitle name instead of id
Router.get('/empexpsummarydetails/:id', async (req, res) => {
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


    `SELECT  emp_expsummary.ID, list_empexpitem.Str1 AS disItemName, emp_expsummary.Notes, emp_expsummary.Description, emp_expsummary.DescriptionPlainText, \
    emp_expsummary.ItemName, emp_expsummary.EmpID \
    FROM  emp_expsummary INNER JOIN \
    list_empexpitem ON emp_expsummary.ItemName = list_empexpitem.ListID \
    WHERE (emp_expsummary.ID = ?)`  ,


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












// UPDATE
Router.post('/update', [
    // check('degree', "Degree cannot be empty.").notEmpty(),
    check('itemname', "Item name cannot be empty.").isInt({ min:1}),

    // check('degree', "Degree cannot be empty.").isInt({ min:1, max: 2000}),
    // check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
],
    function (req, res) {
         const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let post3 = req.body;

        let query = `UPDATE emp_expsummary  SET ? WHERE ID=?`;
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
        check('itemname', "Item name cannot be empty.").isInt({ min:1}),
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
        await utils.maxid("emp_expsummary","ID")
        .then(data => {
            maxid = data;
        });


    req.body.id = maxid + 1;
    let postdata = req.body; 

    mysqlConnection.query('INSERT INTO emp_expsummary SET ?', postdata, function (error, results, fields) {
        if (!error) {
            console.log("success");
            res.send(results);
        } else {
            console.log(error);
        }
    });
});





// DELETE pro team
Router.delete('/:empexpsummaryid', function (req, res) {
    mysqlConnection.query("DELETE FROM emp_expsummary WHERE ID=?", req.param('empexpsummaryid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});


















// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/empdegree-angular-datatable/:empid', function (req, res) {
    Router.post('/empexpsummary-angular-datatable', async function (req, res) { // sending empid in body now
        
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
            // ID
            // ItemName
            // Description
            // DescriptionPlainText
            // Notes
            // EmpID

            0: 'ItemName',
            1: 'DescriptionPlainText',

         }
     
        var totalData = 0;
        var totalbeforefilter = 0;
        var totalFiltered = 0;
        var col = columns[ordercol];// to get name of order col not index
    
        // For Getting the TotalData without Filter
        // let sql1 = `SELECT * FROM pro_descriptions WHERE pro_descriptions.id>0`;
        // let sql1 = `SELECT * FROM pro_descriptions WHERE pro_descriptions.ProjectID=`+ req.body.projectid + ``;//2023

        // mysqlConnection.query(sql1, (err, rows, fields) => {
        //     totalData = rows.length;
        //     totalbeforefilter = rows.length;
        // });

        await utils.totaldata("SELECT COUNT(ID) AS total FROM emp_expsummary WHERE emp_expsummary.EmpID="+ req.body.projectid)
        .then(data => {
            totalData = data;
        });

    
        let sql = 



            `SELECT  emp_expsummary.ID, list_empexpitem.Str1 AS disItemName, emp_expsummary.Notes, emp_expsummary.Description, emp_expsummary.DescriptionPlainText, 
            emp_expsummary.ItemName, emp_expsummary.EmpID 
            FROM  emp_expsummary INNER JOIN 
            list_empexpitem ON emp_expsummary.ItemName = list_empexpitem.ListID 
            WHERE (emp_expsummary.EmpID = `+ req.body.empid + `)`





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
            sql = sql + ` AND list_empexpitem.Str1 LIKE '%${search}%'`;

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





module.exports = Router;
const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const utils = require('../utils');

// authenticateToken can be used locally(on each function) or globally in server for all mod
// const authenticateToken= require('../middleware/authenticateToken');

// Router.get('/all',authenticateToken,  function (req, res) {// with local auth



//************************************************************** */
// AUTHENTICATION FOR INDIVIDUAL ROUTES can be used
//************************************************************** */

// Router.use(authenticateToken); 





// ALL TEST
// Router.get('/all',authenticateToken,  function (req, res) {// with local auth
Router.get('/all',  function (req, res) {
    
    let sql="SELECT * from pro_descriptions"
     mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
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
    Router.post('/prodescription-angular-datatable', async function (req, res) { // sending empid in body now
        
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
            0: 'ItemName',
            1: 'DescriptionPlainText',
            2: 'Action',
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

        await utils.totaldata("SELECT COUNT(ID) AS total FROM pro_descriptions WHERE pro_descriptions.ProjectID="+ req.body.projectid)
        .then(data => {
            totalData = data;
        });

    
        let sql = 



            `SELECT  pro_descriptions.ID, list_prodesitem.Str1 AS disItemName, pro_descriptions.Notes, pro_descriptions.Description, pro_descriptions.DescriptionPlainText, 
            pro_descriptions.ItemName, pro_descriptions.ProjectID
            FROM  pro_descriptions INNER JOIN
            list_prodesitem ON pro_descriptions.ItemName = list_prodesitem.ListID
            WHERE (pro_descriptions.ProjectID = `+ req.body.projectid + `)`



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
            sql = sql + ` AND list_prodesitem.Str1 LIKE '%${search}%'`;

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
Router.get('/duplicateitemid/:itemid/:projectid', function (req, res) {
    // console.log("from maxempid"); 
    // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT *  FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmployeeID=?", req.param('empid'), (err, rows) => {
        // SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total
        var filter = [req.param('itemid'), req.param('projectid')];
        // mysqlConnection.query("SELECT COUNT(*) AS employeeidcount FROM pro_team  WHERE pro_team.EmpID=?", req.param('empid'), (err, rows) => {
        mysqlConnection.query("SELECT COUNT(*) AS itemidcount FROM pro_descriptions  WHERE pro_descriptions.ItemName=? and pro_descriptions.ProjectID=? " , filter, (err, rows, fields) => {

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
    
        let sql = "SELECT * FROM pro_descriptions WHERE pro_descriptions.ID=?";
    
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
Router.get('/prodescriptiondetails/:id', async (req, res) => {
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


        `SELECT  pro_descriptions.ID, list_prodesitem.Str1 AS disItemName, pro_descriptions.Notes, pro_descriptions.Description, pro_descriptions.DescriptionPlainText, \
        pro_descriptions.ItemName, pro_descriptions.ProjectID \
        FROM  pro_descriptions INNER JOIN \
        list_prodesitem ON pro_descriptions.ItemName = list_prodesitem.ListID \
        WHERE (pro_descriptions.ID = ?)`  ,


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
            console.log("TEST4"+req.body)
    
            let query = `UPDATE pro_descriptions  SET ? WHERE ID=?`;
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
            await utils.maxid("pro_descriptions","ID")
            .then(data => {
                maxid = data;
            });
    
    
        req.body.id = maxid + 1;
        let postdata = req.body; 
    
        mysqlConnection.query('INSERT INTO pro_descriptions SET ?', postdata, function (error, results, fields) {
            if (!error) {
                console.log("success");
                res.send(results);
            } else {
                console.log(error);
            }
        });
    });
    
    
    
    
    
    // DELETE pro team
    Router.delete('/:prodescriptionid', function (req, res) {
        mysqlConnection.query("DELETE FROM pro_descriptions WHERE ID=?", req.param('prodescriptionid'), (err, rows, fields) => {
            if (!err) {
                res.send(rows);
            } else {
                console.log(err);
            }
        });
    });
















// // ALL RECORDS FOR DATATABLE
// Router.get('/:projectid', async (req, res) => {
//     try {
//         let projectid = req.param("projectid");
//         let strsql=
            // `SELECT  Pro_Descriptions.ID, List_ProDesItem.Str1 AS disItemName, Pro_Descriptions.Notes, Pro_Descriptions.Description, Pro_Descriptions.DescriptionPlainText, 
            // Pro_Descriptions.ItemName, Pro_Descriptions.ProjectID
            // FROM  Pro_Descriptions INNER JOIN
            // List_ProDesItem ON Pro_Descriptions.ItemName = List_ProDesItem.ListID
            // WHERE (Pro_Descriptions.ProjectID = ${projectid})
            // ORDER BY disItemName`

        
//         let pool = await sql.connect(mssqlconfig)
//         //let pool = await poolPromise
//         let result = await pool.request()
//             // .query(`SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=${empid}`)
//             .query(strsql);
//             res.send(result.recordset);
//     } catch (err) {
//         return res.status(500).send("MSSQL ERROR: " + err);
//     }
// })


// // VIEW 1 RECORD
// Router.get('/view/:id', async (req, res) => {
//     try {
//         let id = req.param("id");

//         let strsql=
//             `SELECT  Pro_Descriptions.ID, List_ProDesItem.Str1 AS disItemName, Pro_Descriptions.Notes, Pro_Descriptions.Description, Pro_Descriptions.DescriptionPlainText, 
//             Pro_Descriptions.ItemName, Pro_Descriptions.ProjectID
//             FROM  Pro_Descriptions INNER JOIN
//             List_ProDesItem ON Pro_Descriptions.ItemName = List_ProDesItem.ListID
//             WHERE (Pro_Descriptions.ID = ${id})`
        
//         let pool = await sql.connect(mssqlconfig)
//         //let pool = await poolPromise
//         let result = await pool.request()
//             // .query(`SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=${empid}`)
//             .query(strsql);
//             res.send(result.recordset[0]);
//     } catch (err) {
//         return res.status(500).send("MSSQL ERROR: " + err);
//     }
// })


// // EDIT
// Router.get('/edit/:id', async function (req, res) {
//     try {
//         let pool = await sql.connect(mssqlconfig)
//         let result = await pool.request()
//             .query(`SELECT * FROM Pro_Descriptions WHERE ID=${req.param("id")}`)
//         res.send(result.recordset[0])
//     } catch (err) {
//         return res.status(500).send("MSSQL ERROR: " + err);
//     }
// });


// // DELETE
// Router.delete('/:id', async function (req, res) {
//     try {
//         let pool = await sql.connect(mssqlconfig)
//         let result = await pool.request()
//             .query(`DELETE FROM Pro_Descriptions WHERE ID=${req.param("id")}`)
//         res.send(result.rowsAffected)
//     } catch (err) {
//         return res.status(500).send("MSSQL ERROR: " + err);
//     }
// });







// // INSERT
// Router.post('/',
//     [
//         check('ItemName', "ItemName cannot be empty.").isInt({ gt: 0 }), 
//         // custom validation to check if EmpID is already selected for this project team
//         check('ItemName').custom(async (ItemName, { req }) => {
        
//             if (await utils.alreadyHaveItem(req.body.ID,"Pro_Descriptions","ProjectID",req.body.ProjectID,"ItemName",ItemName)) {
//             throw new Error ('ItemName already selected for this project');
//             }
//             return true
//         })
//     ],

//     async function (req, res) {

//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(422).json({ errors: errors.array() });
//         }

//         try {
//             // Maxid
//             let childid = await utils.maxid("Pro_Descriptions", "ID")// must use await for calling util common functions
//             const CalculatedID = childid.id + 1
           
           
//             let pool = await sql.connect(mssqlconfig)
//             //** Description is avoided , giving error during add */
//             //   Description(formatted text) is turned of for web version
//             let result = await pool.request()
//                 .query(`INSERT INTO  Pro_Descriptions (
//                 ID,
//                 ItemName,
//                 DescriptionPlainText,
//                 Notes,
//                 ProjectID)
//                 VALUES (
//                 '${CalculatedID}',
//                 '${req.body.ItemName}',
//                 '${req.body.DescriptionPlainText}',
//                 '${req.body.Notes}',
//                 '${req.body.ProjectID}')`)

//                 res.send(result.rowsAffected)

//         } catch (err) {
//             // return res.status(400).send("MSSQL ERROR: " + err);
//             // error used in this format to match with validation errors format for which our frontend is designed 
//             return res.status(500).send({ errors: [{ 'msg': err.message }] });
//         }
//     });






// // UPDATE
// Router.post('/update',
//     [
//         check('ItemName', "ItemName cannot be empty.").isInt({ gt: 0 }),
//         // custom validation to check if EmpID is already selected for this project team
//         check('ItemName').custom(async (ItemName, { req }) => {
//             if (await utils.alreadyHaveItem(req.body.ID,"Pro_Descriptions","ProjectID",req.body.ProjectID,"ItemName",ItemName)) {
//               throw new Error ('ItemName already selected for this project');
//             }
//             return true
//         })
//     ],

//     async function (req, res) {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(422).json({ errors: errors.array() });
//         }

//         try {
//             let pool = await sql.connect(mssqlconfig)
//             // var mysqlTimestamp = await moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
//             //** Description is avoided , giving error during update */
//             //   Description(formatted text) is turned of for web version
//             let result = await pool.request()
//                 .query(`UPDATE Pro_Descriptions  SET 
//                 ItemName='${req.body.ItemName}',
//                 DescriptionPlainText='${req.body.DescriptionPlainText}',
//                 Notes='${req.body.Notes}',
//                 ProjectID='${req.body.ProjectID}'
//                 WHERE ID=${req.body.ID}`)

//             res.send(result.rowsAffected)

//         } catch (err) {
//             // return res.status(400).send("MSSQL ERROR: " + err);
//             // error used in this format to match with validation errors format for which our frontend is designed 
//             return res.status(500).send({ errors: [{ 'msg': err.message }] });
//         }
//     });











module.exports = Router;
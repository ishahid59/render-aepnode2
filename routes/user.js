require('dotenv').config()

const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../connection');
const bcrypt = require('bcrypt');
const moment = require('moment');
// const authenticateToken= require('../middleware/authenticateToken');
const jwt = require('jsonwebtoken'); // NEEDED IN LOGIN



Router.get('/maxuserid', function (req, res) {
    // console.log("from maxempid"); 
    mysqlConnection.query("SELECT MAX(ID) as maxuserid FROM  users", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
        // res.send(result[0].empid);
    });

});

// Used To check for duplicateemployeeid()
Router.get('/duplicateemployeeid/:empid', function (req, res) {
    // console.log("from maxempid"); 
    // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT *  FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmployeeID=?", req.param('empid'), (err, rows) => {
        // SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total
        var filter = [req.param('empid')];
        // mysqlConnection.query("SELECT COUNT(*) AS employeeidcount FROM pro_team  WHERE pro_team.EmpID=?", req.param('empid'), (err, rows) => {
        mysqlConnection.query("SELECT COUNT(*) AS employeeidcount FROM users  WHERE users.empid=?" , filter, (err, rows, fields) => {

        if (err) {
            console.log(err)
        }
        res.send(rows);//note: cannot get result[0].employeeidcount here. But can get value in angular from 'rows'
        // res.send(result[0].empid);
        // console.log("from maxempid"); 
    });
 
});


// Used To check for duplicateemployeeid()
Router.get('/duplicateemail/:email', function (req, res) {
    // console.log("from duplicateemail"); 
    // console.log(req.param('email')); 
    // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT *  FROM  emp_main", (err, result) => {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmployeeID=?", req.param('empid'), (err, rows) => {
        // SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total
        var filter = [req.param('email')]; //depricated
        // var filter = [req.params.email]; //new in express 4

        // mysqlConnection.query("SELECT COUNT(*) AS employeeidcount FROM pro_team  WHERE pro_team.EmpID=?", req.param('empid'), (err, rows) => {
        mysqlConnection.query("SELECT COUNT(*) AS emailcount FROM users  WHERE users.email=?" , filter, (err, rows, fields) => {

        if (err) {
            console.log(err)
        }
        res.send(rows);//note: cannot get result[0].employeeidcount here. But can get value in angular from 'rows'
        // res.send(result[0].empid);
        // console.log("from maxempid"); 
    });
 
});




// All
//  Router.get('/', (req, res) => {
//     let sql = "SELECT users.id, users.email,users.name, users.password, users.remember_token, users.created_at, users.updated_at FROM users";
//     mysqlConnection.query(sql, (err, rows, fields) => {
//         if (!err) {
//             res.json(rows);
//         } else {
//             console.log(err);
//         }
//     });
// })




// // INSERT
// Router.post('/', async (req, res) => {
//     var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
//     const hashedPassword = await bcrypt.hash(req.body.password, 10)
//     const user = {
//         empid : req.body.empid, //2023
//         user_role : req.body.user_role, //2023
//         name: req.body.name,
//         email: req.body.email,
//         password: hashedPassword,
//         created_at: mysqlTimestamp
//     }
//     mysqlConnection.query('INSERT INTO users SET ?', user, function (error, results, fields) {
//         if (!error) {
//             // console.log(query.sql); 
//             console.log("success");
//             res.send(user);
//         } else {
//             console.log(error);
//         }
//     });
// });




// INSERT
Router.post('/', [
    check('email', "email cannot be empty.").notEmpty(),
    check('empid', "EmployeeID cannot be empty.").isInt({ min:1}),
],


    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }


        var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {
            empid: req.body.empid, //2023
            user_role: req.body.user_role, //2023
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            created_at: mysqlTimestamp
        }

        
        mysqlConnection.query('INSERT INTO users SET ?', user, function (error, results, fields) {
            if (!error) {
                // console.log(query.sql); 
                console.log("success");
                res.send(user);
            } else {
                console.log(error);
            }
        });
    });







// EDIT Get
Router.get('/:id', function (req, res) {
    // console.log("TEST FROM USER")
    //  mysqlConnection.query("SELECT users.id, users.email,users.name, users.password, users.remember_token, users.created_at, users.updated_at FROM users WHERE users.id=?", req.param('id'), (err, rows, fields) => {
    mysqlConnection.query("SELECT * FROM users WHERE users.id=?", req.param('id'), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]); //NOTE Have to send the [0] row
            // console.log("TEST FROM USER"+rows)
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});



// DELETE
Router.delete('/:id', function (req, res) {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
    mysqlConnection.query("DELETE FROM users WHERE users.id=?", req.param('id'), (err, rows, fields) => {
        if (!err) {
            res.send(rows);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});



// UPDATE
// can also use "put" instead of "post". Frontend service function has to same
// Router.put('/update',
Router.post('/update',
    [
        check('name', "name cannot be empty").notEmpty(),
        check('email', "must be a valid email").isEmail()
    ],

    // function (req, res) {
    async function (req, res) { //2023

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        // console.log(req.body.email);
        let id = req.body.id;
        let empid = req.body.empid; //2023
        let user_role = req.body.user_role; //2023
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.password;
        let remember_token = req.body.remember_token;
        let created_at = req.body.created_at;
        let updated_at = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'); // can use mysqlTimestamp;//
        // const hashedPassword = await bcrypt.hash(req.body.password, 10)
        // const hashedPassword = await bcrypt.hash(req.body.password, 10) //2023 todo need to turn or for change pass
        const hashedPassword = req.body.password;

        let query = `UPDATE users SET empid = ?, user_role = ?, name = ?, email = ?, password = ?, remember_token = ?, created_at = ?, updated_at = ? WHERE id=?`;
        // mysqlConnection.query(query, [name, email, password, remember_token, created_at, updated_at, id], (err, rows, fields) => {
            // mysqlConnection.query(query, [name, email, hashedPassword, remember_token, created_at, updated_at, id], (err, rows, fields) => {
                mysqlConnection.query(query, [empid, user_role, name, email, hashedPassword, remember_token, created_at, updated_at, id], (err, rows, fields) => {

            if (!err) {
                res.send(rows);
            } else {
                console.log(err);
            }
        });
    });


// UPDATE PASSWORD
// can also use "put" instead of "post". Frontend service function has to same
// Router.put('/update',
Router.post('/updatepassword',
    [
        check('name', "name cannot be empty").notEmpty(),
        check('email', "must be a valid email").isEmail()
    ],

    // function (req, res) {
    async function (req, res) { //2023

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        console.log(req.body.email);

        let id = req.body.id;
        let empid = req.body.empid; //2023
        let user_role = req.body.user_role; //2023
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.password;
        let remember_token = req.body.remember_token;
        let created_at = req.body.created_at;
        let updated_at = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        // const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const hashedPassword = await bcrypt.hash(req.body.password, 10) //2023 todo need to turn or for change pass
        // const hashedPassword = req.body.password;

        let query = `UPDATE users SET empid = ?, user_role = ?, name = ?, email = ?, password = ?, remember_token = ?, created_at = ?, updated_at = ? WHERE id=?`;
        // mysqlConnection.query(query, [name, email, password, remember_token, created_at, updated_at, id], (err, rows, fields) => {
            // mysqlConnection.query(query, [name, email, hashedPassword, remember_token, created_at, updated_at, id], (err, rows, fields) => {
                mysqlConnection.query(query, [empid, user_role, name, email, hashedPassword, remember_token, created_at, updated_at, id], (err, rows, fields) => {

            if (!err) {
                res.send(rows);
            } else {
                console.log(err);
            }
        });
    });





// LOGIN
Router.post('/login',
    [
        check('email', "Email cannot be empty").notEmpty().isEmail().withMessage("Must be a valid email"),
        check('password', "Password cannot be empty").notEmpty()
    ],

    (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(errors);
        }

        mysqlConnection.query("SELECT * FROM users WHERE users.email=?", req.body.email, async (err, rows, fields) => {

            if (!err) {

                const user = rows[0];
                if (user == null) {
                    // return res.status(400).send('Cannot find user');
                    return res.status(400).send({ errors: [{ 'msg': 'Cannot find user' }] });
                }

                try {
                    if (await bcrypt.compare(req.body.password, rows[0].password)) {
                        // res.send('Success') // only use 1 send accessToken cannot be send if this send is used
                        const useremail = req.body.email;
                        const user2 = { email: useremail };
                        //**for creation token must pass SECRET key .env file to heroku */
                        const accessToken = jwt.sign(user2, process.env.ACCESS_TOKEN_SECRET)
                        res.json({ access_token: accessToken,user: user});
                    }
                    else {
                        // res.send('Not allowed')
                        return res.status(422).json({ errors: [{ 'msg': 'Incorrect password' }] });
                    }
                } catch (error) {
                    res.status(500).send(error.message);
                }

            } else {
                res.status(500).send(err.message)
            }

        }) // end mysqlConnection

    }) // end Router.post








// used with angular 20221130 with angular-datatable for emp degree
// Search Datatable severside code
// *******************************************************************************************************
    
// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/empdegree-angular-datatable/:empid', function (req, res) {
    Router.post('/user-angular-datatable', function (req, res) { // sending empid in body now
        
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

            // 0: 'Email',
            // 1: 'Name',
            // // 3:'Password',
            // // 4:'remember_token',
            // 2:'created_at',
            // 3:'updated_at',

            0: 'disEmployeeID',
            1: 'user_role',         
            2: 'email',
            3: 'name',
            4:'created_at',
            5:'updated_at',
            6: 'Action'
         }
    
        var totalData = 0;
        var totalbeforefilter = 0;
        var totalFiltered = 0;
        var col = columns[ordercol];// to get name of order col not index
    
        // For Getting the TotalData without Filter
        let sql1 = `SELECT * FROM users WHERE users.id>0`;
        mysqlConnection.query(sql1, (err, rows, fields) => {
            totalData = rows.length;
            // totalbeforefilter = rows.length;
        });
    
        let sql = 

        // `SELECT emp_main.EmployeeID AS disEmployeeID, list_empprojectrole.Str1 AS disEmpProjectRole, list_empprojectrole_1.Str1 AS disSecProjectRole, pro_team.ID, \
        //     pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, pro_team.MonthsOfExp, pro_team.Notes, pro_team.ProjectID, \ 
        //     pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID \
        //     FROM pro_team INNER JOIN \
        //     emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
        //     list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
        //     list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
        //     WHERE (pro_team.ProjectID = `+ req.body.projectid + `)`

        // `SELECT users.id, users.empid, users.user_role, users.email, users.name, users.password, users.remember_token, users.created_at, users.updated_at FROM users`
        `SELECT users.*, emp_main.EmployeeID as disEmployeeID
        FROM     users INNER JOIN
        emp_main ON users.empid = emp_main.EmpID`

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
            // sql = sql + ` AND users.name LIKE '%${search}%'`;
            // sql = sql + ` OR users.email LIKE '%${search}%'`;
            sql = sql + ` WHERE users.name LIKE '%${search}%'`;
            sql = sql + ` OR users.email LIKE '%${search}%'`;
            sql = sql + ` OR users.user_role LIKE '%${search}%'`;
            sql = sql + ` OR emp_main.EmployeeID LIKE '%${search}%'`;

            // //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
            // So total filtered record is calculated before applying limit and
            let totalbeforelimitandoffset = 0;
            let sql3 = sql + ` order by ${col} ${orderdir} `;
            mysqlConnection.query(sql3, (err, rows3, fields) => {
                totalbeforelimitandoffset = rows3.length;
                // console.log("testtotal :: " + sql3);
            });


            sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
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
    


    // Get userrole by ID, Not using
    Router.get('/checkrole/:id/:modulename', function (req, res) {
        // try {
        //     let pool = await sql.connect(mssqlconfig)
        //     let result = await pool.request()
        //     .query(`SELECT * FROM UAccess_Control WHERE ID=${req.param("id")}`)
        //     res.send(result.recordset);
        // } catch (err) {
        //     return res.status(400).send("MSSQL ERROR: " + err);
        // }
        var filter = [req.param('id'), req.param('modulename')];
        // mysqlConnection.query("SELECT * FROM uaccess_control WHERE uaccess_control.id=?" , req.param('id'), (err, rows, fields) => {
            mysqlConnection.query("SELECT * FROM uaccess_control WHERE uaccess_control.ID=? and uaccess_control.ModuleName=? " , filter, (err, rows, fields) => {
        if (!err) {
                res.send(rows[0]); 
            } else {
                console.log(err);
            }
        });


    });


    // Get userrole by ID, Not using
    Router.get('/checkuserrole/:password', function (req, res) {
        // try {
        //     let pool = await sql.connect(mssqlconfig)
        //     let result = await pool.request()
        //     .query(`SELECT * FROM UAccess_Control WHERE ID=${req.param("id")}`)
        //     res.send(result.recordset);
        // } catch (err) {
        //     return res.status(400).send("MSSQL ERROR: " + err);
        // }
        // var filter = [req.param('password')];
        // mysqlConnection.query("SELECT * FROM uaccess_control WHERE uaccess_control.id=?" , req.param('id'), (err, rows, fields) => {
            // let result = req.param('password').replace("/", "%2F");
            // console.log(req.param('password'));
        mysqlConnection.query("SELECT users.user_role FROM users WHERE users.password=?" , req.param('password'), (err, rows, fields) => {
// console.log("up"+rows[0].user_role);
        // mysqlConnection.query("SELECT user_role FROM users WHERE users.password=?" , filter, (err, rows, fields) => {
        if (!err) { 
                res.send(rows[0]); 
            } else {
                console.log(err);
            }
        });
    });




// will use later tested
// 2023 get all user roles in th uaccess_control table for the userid(empid) comparing hashed password
//   Router.get('/getuserroles/:id/:modulename', function (req, res) {
Router.get('/getuserroles/:password', function (req, res) {

    // try {
    //     let pool = await sql.connect(mssqlconfig)
    //     let result = await pool.request()
    //     .query(`SELECT * FROM UAccess_Control WHERE ID=${req.param("id")}`)
    //     res.send(result.recordset);
    // } catch (err) {
    //     return res.status(400).send("MSSQL ERROR: " + err);
    // }

    // var filter = [req.param('id'), req.param('modulename')];

    // mysqlConnection.query("SELECT * FROM uaccess_control WHERE uaccess_control.id=?" , req.param('id'), (err, rows, fields) => {
    // mysqlConnection.query("SELECT * FROM uaccess_control WHERE uaccess_control.ID=? and uaccess_control.ModuleName=? " , filter, (err, rows, fields) => {
    // mysqlConnection.query("SELECT * FROM uaccess_control WHERE uaccess_control.ID=?" , req.param('id'), (err, rows, fields) => {

        
        mysqlConnection.query(
         `SELECT uaccess_control.ID, uaccess_control.ModuleName, uaccess_control.ViewData, uaccess_control.EditData, uaccess_control.AddData, uaccess_control.DeleteData
        FROM uaccess_control INNER JOIN
        users ON uaccess_control.ID = users.empid
        WHERE users.password = ?` , 
        req.param('password'), (err, rows, fields) => {
        
        if (!err) {
            // res.send(rows[0]);
            res.send(rows);

        } else {
            console.log(err);
        }
    });


});








    // function authenticateToken(req, res, next) {
    //     const authHeader = req.headers['authorization']
    //     const token = authHeader && authHeader.split(' ')[1]
    //      if (token == null) return res.sendStatus(401);
    
    //     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    //         console.log(err)
    //         if (err) return res.sendStatus(403)
    //         req.user = user
    //         next()
    //     })
    // }







// MSSQL CODES
// ****************************************************************

// // Check Permission
// Router.get('/checkrole/:id/:module', async function (req, res) {
//     try {
//         let pool = await sql.connect(mssqlconfig)
//         let result = await pool.request()
//            .query(`SELECT * FROM UAccess_Control WHERE ID=${req.param("id")} AND ModuleName='${req.param("module")}'`)
//         res.send(result.recordset[0]);
//     } catch (err) {
//         return res.status(400).send("MSSQL ERROR: " + err);
//     }
// });





// // Get userrole by ID, Not using
// Router.get('/userrole/:id', async function (req, res) {
//     try {
//         let pool = await sql.connect(mssqlconfig)
//         let result = await pool.request()
//            .query(`SELECT * FROM UAccess_Control WHERE ID=${req.param("id")}`)
//         res.send(result.recordset);
//     } catch (err) {
//         return res.status(400).send("MSSQL ERROR: " + err);
//     }
// });






module.exports = Router;


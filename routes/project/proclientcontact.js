const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const utils = require('../utils');



// DETAIL PAGE used in ANGULAR 2022 to get jobtitle name instead of id
Router.get('/proclientcontactdetails/:projectid', async (req, res) => {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
    mysqlConnection.query(

       
        // `SELECT emp_main.EmployeeID AS disEmployeeID, list_empprojectrole.Str1 AS disEmpProjectRole, list_empprojectrole_1.Str1 AS disSecProjectRole, pro_team.ID, \
        // pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, pro_team.MonthsOfExp, pro_team.Notes, pro_team.ProjectID, \ 
        // pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID \
        // FROM pro_team INNER JOIN \
        // emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
        // list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
        // list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
        // WHERE pro_team.ID = ?`  ,  


        `SELECT pro_clientcontact.ID, pro_clientcontact.Person1, pro_clientcontact.Person2, pro_clientcontact.Person3,   pro_clientcontact.Notes, pro_clientcontact.CAOID, pro_clientcontact.ProjectID 
                FROM  pro_clientcontact 
                WHERE pro_clientcontact.ProjectID = ?`    ,  


     req.param('projectid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});


Router.get('/maxproclientcontactid', function (req, res) {
    // console.log("from maxempid"); 
    mysqlConnection.query("SELECT MAX(ID) as maxproclientcontactid FROM  pro_clientcontact", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
        // res.send(result[0].empid);
    });

});




// SELECT COUNT(id) FROM table WHERE id = 123
Router.get('/checkforprojectid/:projectid', function (req, res) {
        mysqlConnection.query(

            // `SELECT COUNT(ProjectID) FROM pro_datesandcosts WHERE pro_datesandcosts.ProjectID = ?`    ,  
            // `SELECT COUNT(ProjectID) as FROM pro_datesandcosts WHERE pro_datesandcosts.ProjectID = ?`    ,  
            `SELECT *  FROM pro_clientcontact WHERE pro_clientcontact.ProjectID = ?`    ,  


         req.param('projectid'), (err, rows, fields) => {
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

    let sql = "SELECT * FROM pro_clientcontact WHERE pro_clientcontact.ProjectID=?";

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
    check('notes', "Project Client contact cannot be empty.").notEmpty(),
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

        let query = `UPDATE pro_clientcontact  SET ? WHERE ID=?`;
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
        check('notes', "Project Client contact cannot be empty.").notEmpty(),
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
        await utils.maxid("pro_clientcontact","ID")
        .then(data => {
            maxid = data;
        });


    req.body.id = maxid + 1;
    let postdata = req.body; 

    mysqlConnection.query('INSERT INTO pro_clientcontact SET ?', postdata, function (error, results, fields) {
        if (!error) {
            console.log("success");
            res.send(results);
        } else {
            console.log(error);
        }
    });
});





// DELETE pro_clientcontact
Router.delete('/:projectid', function (req, res) {
    mysqlConnection.query("DELETE FROM pro_clientcontact WHERE ProjectID=?", req.param('projectid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});








// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/empdegree-angular-datatable/:empid', function (req, res) {
    Router.get('/proclientcontactdetails/:projectid', async (req, res) => { // sending empid in body now

        // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
            mysqlConnection.query(
    
                // ID
                // Person1
                // Person2
                // Person3
                // Notes
                // CAOID
                // ProjectID
                
                `SELECT pro_clientcontact.ID, pro_clientcontact.Person1, pro_clientcontact.Person2, pro_clientcontact.Person3,  pro_clientcontact.Zipcode, pro_clientcontact.Notes, pro_clientcontact.CAOID, pro_clientcontact.ProjectID,
                FROM  pro_clientcontact
                WHERE pro_clientcontact.ID = ?`    ,  
        
        
             req.param('projectid'), (err, rows, fields) => {
                if (!err) {
                    res.send(rows[0]);
                    // res.render("Hello.ejs", {name:rows});
                } else {
                    console.log(err);
                }
            });
        });




module.exports = Router;
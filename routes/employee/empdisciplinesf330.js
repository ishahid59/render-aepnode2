const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const utils = require('../utils');





Router.get('/maxempregid', function (req, res) {
    // console.log("from maxempid"); 
    mysqlConnection.query("SELECT MAX(ID) as maxdisciplinesf330id FROM  emp_disciplinesf330", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
        // res.send(result[0].empid);
    });

});


    // Used To check for duplicateemployeeid()
    Router.get('/duplicateitemid/:secondarydisciplinesf330/:empid', function (req, res) {
        // console.log("from maxempid"); 
        // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
        // mysqlConnection.query("SELECT *  FROM  emp_main", (err, result) => {
        // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmployeeID=?", req.param('empid'), (err, rows) => {
            // SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total
            var filter = [req.param('secondarydisciplinesf330'), req.param('empid')];
            // mysqlConnection.query("SELECT COUNT(*) AS employeeidcount FROM pro_team  WHERE pro_team.EmpID=?", req.param('empid'), (err, rows) => {
            mysqlConnection.query("SELECT COUNT(*) AS itemidcount FROM emp_disciplinesf330  WHERE emp_disciplinesf330.SecondaryDisciplineSF330=? and emp_disciplinesf330.EmpID=? " , filter, (err, rows, fields) => {
    
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

    let sql = "SELECT * FROM emp_disciplinesf330 WHERE emp_disciplinesf330.ID=?";

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
    check('secondarydisciplinesf330', "DisciplineSF330 cannot be empty.").isInt({ min:1}),
    // check('degree', "Degree cannot be empty.").isInt({ min:1, max: 2000}),
    // check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
],
    function (req, res) {
         const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let post3 = req.body;

        let query = `UPDATE emp_disciplinesf330  SET ? WHERE ID=?`;
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
    check('secondarydisciplinesf330', "DisciplineSF330 cannot be empty.").isInt({ min: 1 }),
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
        await utils.maxid("emp_disciplinesf330", "ID")
            .then(data => {
                maxid = data;
            });

        // console.log("test:"+req.body.id +" :  "+maxid)
        // return;
        req.body.id = maxid + 1;
        let postdata = req.body;

        mysqlConnection.query('INSERT INTO emp_disciplinesf330 SET ?', postdata, function (error, results, fields) {
            if (!error) {
                console.log("success");
                res.send(results);
            } else {
                console.log(error);
            }
        });
    });





// DELETE pro team
Router.delete('/:empdisciplinesf330id', function (req, res) {
    mysqlConnection.query("DELETE FROM emp_disciplinesf330 WHERE ID=?", req.param('empdisciplinesf330id'), (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});




            
// DETAIL PAGE used in ANGULAR 2022 to get jobtitle name instead of id
Router.get('/empdisciplinesf330details/:id', async (req, res) => {
             
    
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
    mysqlConnection.query(

        // `SELECT list_empregistration.Str1 AS disRegistration, list_state.Str1 AS disRegState, list_country.Str1 AS disCountry, emp_registration.ID, emp_registration.RegYear, \
        // emp_registration.RegIssueDate, emp_registration.RegExpDate, emp_registration.RegistrationNo, emp_registration.Notes, emp_registration.Registration, \
        // emp_registration.RegState, emp_registration.Country, emp_registration.EmpID \
        // FROM emp_registration INNER JOIN \
        // list_empregistration ON emp_registration.Registration = list_empregistration.ListID INNER JOIN \
        // list_state ON emp_registration.RegState = list_state.ListID INNER JOIN \
        // list_country ON emp_registration.Country = list_country.ListID \
        // WHERE emp_registration.ID = ?`

        `SELECT list_disciplinesf330.Str2 AS disSecondaryDisciplineSF330, emp_disciplinesf330.ID, emp_disciplinesf330.EmpID,emp_disciplinesf330.Notes 
        FROM emp_disciplinesf330 INNER JOIN 
        list_disciplinesf330 ON emp_disciplinesf330.SecondaryDisciplineSF330 = list_disciplinesf330.ListID 
        WHERE (emp_disciplinesf330.ID = ?)`
    ,

     req.param('id'), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});


















// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/empdegree-angular-datatable/:empid', function (req, res) {
    Router.post('/empdisciplinesf330-angular-datatable', async function (req, res) { // sending empid in body now

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
            // EmpID
            // ID
            // Notes
            // SecondaryDisciplineSF330

            0: 'SecondaryDisciplineSF330',
            1: 'Notes',

         }
         
    
        var totalData = 0;
        var totalbeforefilter = 0;
        var totalFiltered = 0;
        var col = columns[ordercol];// to get name of order col not index
    
        // For Getting the TotalData without Filter
        // let sql1 = `SELECT * FROM emp_registration WHERE emp_registration.id>0`;
        //**2023 Chils table queries for total before filter should be like this */
        // let sql1 = `SELECT * FROM emp_registration WHERE emp_registration.EmpID=`+ req.body.empid + ``;//2023
        // mysqlConnection.query(sql1, (err, rows, fields) => {
        //     totalData = rows.length;
        //     totalbeforefilter = rows.length;
        // });



        // ** After using pool conn the mysql order has changed. So to keep the order async await is used
        // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
        // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

        // await utils.totaldata("SELECT COUNT(ID) AS total FROM emp_registration WHERE emp_registration.EmpID="+ req.body.empid)
        await utils.totaldata("SELECT COUNT(ID) AS total FROM emp_disciplinesf330 WHERE emp_disciplinesf330.EmpID="+ req.body.empid)

        .then(data => {
            totalData = data;
        });
        // const value = await totaldata();

         let sql = 
        
        `SELECT list_disciplinesf330.Str2 AS disSecondaryDisciplineSF330, emp_disciplinesf330.ID, emp_disciplinesf330.EmpID,emp_disciplinesf330.Notes 
        FROM emp_disciplinesf330 INNER JOIN 
        list_disciplinesf330 ON emp_disciplinesf330.SecondaryDisciplineSF330 = list_disciplinesf330.ListID 
        WHERE (emp_disciplinesf330.EmpID= `+ req.body.empid + `)`


        if (search == "") {
            // console.log("No Search");
            sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
            // console.log(sql);
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
            sql = sql + ` AND list_disciplinesf330.Str2 LIKE '%${search}%'`;

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
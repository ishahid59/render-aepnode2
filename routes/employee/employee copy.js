const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
// authenticateToken can be used locally(on each function) or globally in server for all mod
// const authenticateToken= require('../middleware/authenticateToken');



// ALL TEST
// Router.get('/all',authenticateToken,  function (req, res) {// with local auth
Router.get('/all',  function (req, res) {
    console.log(req.body)
    let sql="SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
     list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
     emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
     INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0 order by emp_main.empid"

     mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});




// Datatable severside code Working
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
    let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
    list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
    emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
    INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0`


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
        console.log("No Search");
        sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        console.log(sql);
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
        console.log(sql);
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
        console.log("No Search");
        sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        console.log(sql);
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
        console.log(sql);
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



// used with angular 20221130 with angular-datatable
// Search Datatable severside code
// *******************************************************************************************************
    
// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
    Router.post('/search/angular-datatable', function (req, res) {
    // console.log(req.body.name);
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
            console.log("No Search");
            sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
            console.log(sql);
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
            console.log(sql);
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
    




// EDIT GET
Router.get('/:empid', function (req, res) {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
    mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid=?", req.param('empid'), (err, rows, fields) => {
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



// DETAIL PAGE used in ANGULAR 2022 to get jobtitle name instead of id
Router.get('/empdetails/:empid', function (req, res) {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
    mysqlConnection.query(
        `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
        list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
        emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
        INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid=?`
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
        check('firstname',"Firstname cannot be empty.").notEmpty()
        ], 
        function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

    // console.log(req.body);
    // return
    console.log(req.body.hiredate);
    let postdata = req.body;

    // if(req.body.hiredate==null){
    //     req.body.hiredate="0000-00-00";
    // }


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
    check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
],
    function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        //Consulant Checked send 1, but unchecked sends null so be manually put in 0
        if (req.body.consultant == null) {
            req.body.consultant = 0;
        }
        
        let post3 = req.body;
        console.log(post3);
        let query = `UPDATE emp_main  SET ? WHERE empid=?`;
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

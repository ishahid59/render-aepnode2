const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
// authenticateToken can be used locally(on each function) or globally in server for all mod
// const authenticateToken= require('../middleware/authenticateToken');





// Employee combo
// Router.get('/all',authenticateToken,  function (req, res) {// with local auth
Router.get('/cmbemp',  function (req, res) {
     let sql="SELECT emp_main.EmpID, emp_main.EmployeeID from emp_main WHERE emp_main.EmpID>0 order by emp_main.EmployeeID"
     mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});


// cmb jobtitle
Router.get('/cmbempjobtitle',  (req, res) => {
    let sql = "SELECT list_empjobtitle.ListID, list_empjobtitle.Str1 FROM list_empjobtitle WHERE list_empjobtitle.ListID>-1 ORDER BY list_empjobtitle.ListID";
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
})


// registration cmb used in Emp search. Need to move
Router.get('/cmbempreg',  (req, res) => {
    let sql = "SELECT list_empregistration.ListID, list_empregistration.Str1,list_empregistration.Str2 FROM list_empregistration WHERE list_empregistration.ListID>-1 ORDER BY list_empregistration.ListID";
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
})



Router.get('/cmbempdegree',  (req, res) => {
    let sql = "SELECT list_empdegree.ListID, list_empdegree.Str1, list_empdegree.str2 FROM list_empdegree WHERE list_empdegree.ListID>-1 ORDER BY list_empdegree.ListID";
    // let sql = "SELECT * FROM list_empdegree WHERE list_empdegree.listid>-1 ORDER BY list_empdegree.listid";
 
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
            // console.log(res.json(rows));
        } else {
            console.log(err);
        }
    });
})




Router.get('/cmbempdepartment',  (req, res) => {
    let sql = "SELECT list_department.ListID, list_department.Str1 FROM list_department WHERE list_department.ListID>-1 ORDER BY list_department.ListID";
    // let sql = "SELECT * FROM list_empdegree WHERE list_empdegree.listid>-1 ORDER BY list_empdegree.listid";
 
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
            // console.log(res.json(rows));
        } else {
            console.log(err);
        }
    });
})


Router.get('/cmbemptraining',  (req, res) => {
    let sql = "SELECT list_emptraining.ListID, list_emptraining.Str1,list_emptraining.Str2 FROM list_emptraining WHERE list_emptraining.ListID>-1 ORDER BY list_emptraining.ListID";
    // let sql = "SELECT * FROM list_empdegree WHERE list_empdegree.listid>-1 ORDER BY list_empdegree.listid";
 
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
            // console.log(res.json(rows));
        } else {
            console.log(err);
        }
    });
})



Router.get('/cmbempstatus',  (req, res) => {
    let sql = "SELECT list_empstatus.ListID, list_empstatus.Str1 FROM list_empstatus WHERE list_empstatus.ListID>-1 ORDER BY list_empstatus.ListID";
    // let sql = "SELECT * FROM list_empdegree WHERE list_empdegree.listid>-1 ORDER BY list_empdegree.listid";
 
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
            // console.log(res.json(rows));
        } else {
            console.log(err);
        }
    });
})

 
Router.get('/cmbempsuffix',  (req, res) => {
    let sql = "SELECT list_empsuffix.ListID, list_empsuffix.Str1 FROM list_empsuffix WHERE list_empsuffix.ListID>-1 ORDER BY list_empsuffix.ListID";
    // let sql = "SELECT * FROM list_empdegree WHERE list_empdegree.listid>-1 ORDER BY list_empdegree.listid";
 
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
            // console.log(res.json(rows));
        } else {
            console.log(err);
        }
    });
})


Router.get('/cmbemprefix',  (req, res) => {
    let sql = "SELECT list_empprefix.ListID, list_empprefix.Str1 FROM list_empprefix WHERE list_empprefix.ListID>-1 ORDER BY list_empprefix.ListID";
    // let sql = "SELECT * FROM list_empdegree WHERE list_empdegree.listid>-1 ORDER BY list_empdegree.listid";
 
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
            // console.log(res.json(rows));
        } else {
            console.log(err);
        }
    });
})



Router.get('/cmbstate',  (req, res) => {
    let sql = "SELECT list_state.ListID, list_state.Str1,list_state.Str2 FROM list_state WHERE list_state.ListID>-1 ORDER BY list_state.ListID";
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
})



Router.get('/cmbcountry',  (req, res) => {
    let sql = "SELECT list_country.ListID, list_country.Str1 FROM list_country WHERE list_country.ListID>-1 ORDER BY list_country.ListID";
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
})



Router.get('/cmbempdisciplinesf330',  (req, res) => {
    let sql = "SELECT list_disciplinesf330.ListID, list_disciplinesf330.Str1,list_disciplinesf330.Str2 FROM list_disciplinesf330 WHERE list_disciplinesf330.ListID>-1 ORDER BY list_disciplinesf330.ListID";
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
})


Router.get('/cmbempexpitem',  (req, res) => {
    let sql = "SELECT * FROM list_empexpitem WHERE list_empexpitem.ListID>-1 ORDER BY list_empexpitem.ListID";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})



// COMMON LIST ITEMS
// *********************************************************************************
// Router.get('/getcommonlistitems/:listtablename', function (req, res) {
    // Router.post('/getcommonlistitems/:listtablename', function (req, res) {


//     // console.log("TEST FROM USER")
//     //  mysqlConnection.query("SELECT users.id, users.email,users.name, users.password, users.remember_token, users.created_at, users.updated_at FROM users WHERE users.id=?", req.param('id'), (err, rows, fields) => {
//     let tname=    req.param('listtablename')
//     // mysqlConnection.query("SELECT * FROM listtablename=?", req.param('listtablename'), (err, rows, fields) => {
//     mysqlConnection.query("SELECT * FROM "+tname+"", (err, rows, fields) => {
//         if (!err) {
//             res.send(rows); //NOTE Have to send the [0] row
//             // console.log("TEST FROM USER"+rows)
//             // res.render("Hello.ejs", {name:rows});
//         } else {
//             console.log(err);
//         }
//     });
// });










//***************************************************************************************************** */
// COMMON LIST ITEMS FUNCTIONS
//***************************************************************************************************** */



// Datatable Common List Items
Router.post('/listitems-angular-datatable', function (req, res) { // sending empid in body now
        
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
  

    // get the table name
    let listtablename = req.body.listtablename;
 
    // to get the column name from index since dtable sends col index
    var columns = {

        0: 'ListID',
        1: 'Str1',         
        2: 'Str2',
     }
 
    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index

    // For Getting the TotalData without Filter
    // let sql1 = `SELECT * FROM users WHERE users.id>0`;
    // let sql1 = `SELECT * FROM list_empjobtitle WHERE list_empjobtitle.ListID>0`;
    let sql1 = `SELECT * FROM ${listtablename} WHERE ${listtablename}.ListID>0`;

    // console.log("test:  "+sql1);
    // return;
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
    // `SELECT users.*, emp_main.EmployeeID as disEmployeeID
    // FROM     users INNER JOIN
    // emp_main ON users.empid = emp_main.EmpID`
    `SELECT * FROM ${listtablename} WHERE ${listtablename}.ListID>0`

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

        // sql = sql + ` WHERE list_empjobtitle.Str1 LIKE '%${search}%'`;
        // sql = sql + ` OR list_empjobtitle.Str2 LIKE '%${search}%'`;



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



// GetMaxid Common List Items
Router.get('/maxlistitemsid/:listtablename/', function (req, res) {
    // console.log("from maxempid"); 
    mysqlConnection.query("SELECT MAX(ListID) as maxlistitemsid FROM  "+req.param('listtablename')+"", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
        // res.send(result[0].empid);
    });

});
  

// EDIT GET Common List Items
Router.get('/:listtablename/:id', function (req, res) {
    // try {
    //     let pool = await sql.connect(mssqlconfig)
    //     let result = await pool.request()
    //     .query(`SELECT * FROM UAccess_Control WHERE ID=${req.param("id")}`)
    //     res.send(result.recordset);
    // } catch (err) {
    //     return res.status(400).send("MSSQL ERROR: " + err);
    // }
    var filter = [req.param('listtablename'), req.param('id')];
    // mysqlConnection.query("SELECT * FROM uaccess_control WHERE uaccess_control.id=?" , req.param('id'), (err, rows, fields) => {
    mysqlConnection.query("SELECT * FROM " + req.param('listtablename') + " WHERE " + req.param('listtablename') +".ListID=" + req.param('id') + "", filter, (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
        } else {
            console.log(err);
        }
    });

});



// UPDATE Common List Items
Router.post('/update/:listtablename', [
    // check('degree', "Degree cannot be empty.").notEmpty(),
    check('str1', "Str1 cannot be empty.").notEmpty(),
    // check('degree', "Degree cannot be empty.").isInt({ min:1, max: 2000}),
    // check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
],
    function (req, res) {
         const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let post3 = req.body;

        let query = "UPDATE " + req.param('listtablename')+"  SET ? WHERE ListID=?";
        mysqlConnection.query(query, [post3, req.body.listid], (err, rows, fields) => {
            if (!err) {
                res.send(rows);
                console.log(post3);
            } else {
                console.log("err");
            }
        });
    });




// INSERT Common List Items
// Router.post('/', function (req, res) {
    // With express-Validator   
    Router.post('/:listtablename',[ 
        check('str1', "Str1 cannot be empty.").notEmpty(),
    ], 
        function (req, res) {
           
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

   
    let postdata = req.body; 

    mysqlConnection.query("INSERT INTO  " + req.param('listtablename')+" SET ?", postdata, function (error, results, fields) {

    if (!error) {
            console.log("success");
            res.send(results);
        } else {
            console.log(error);
        }
    });
});





// DELETE Common List Items
Router.delete('/:listtablename/:id', function (req, res) {
    // mysqlConnection.query("DELETE FROM "+req.param('listtablename')+" WHERE ListID=?", req.param('id'), (err, rows, fields) => {
    // mysqlConnection.query("DELETE FROM "+req.param('listtablename')+" WHERE "+req.param('listtablename')+".ListID="+req.param('id')+"", req.param('id'), (err, rows, fields) => {
       mysqlConnection.query("DELETE FROM "+req.param('listtablename')+" WHERE ListID=?", req.param('id'), (err, rows, fields) => {

    if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});





// Router.get('/test', async(req, res) => {
//     // const week = DateTime.now().weekNumber

//     try {
//         const query = "SELECT * FROM emp_main";
//         const rows = await mysqlConnection.query(query);
//         return rows;
//     } catch (err) {
//         console.log('ERROR => ' + err);
//         return err;
//     } finally {
//         // sql.end();
//     }


//   })








// Router.get('/emp', async (req, res) => {
//     try {
//         let pool = await sql.connect(mssqlconfig)
//         //let pool = await poolPromise

//         let jobtitle = await pool.request()
//             .query(`SELECT * FROM List_EmpJobTitle WHERE List_EmpJobTitle.ListID>-1 ORDER BY List_EmpJobTitle.ListID`)
//         let department = await pool.request()
//             .query(`SELECT * FROM List_Department WHERE List_Department.ListID>-1 ORDER BY List_Department.ListID`)
//         let prefix = await pool.request()
//             .query(`SELECT * FROM List_EmpPrefix WHERE List_EmpPrefix.ListID>-1 ORDER BY List_EmpPrefix.ListID`)
//         let suffix = await pool.request()
//             .query(`SELECT * FROM List_EmpSuffix WHERE List_EmpSuffix.ListID>-1 ORDER BY List_EmpSuffix.ListID`)
//         let registration = await pool.request()
//             .query(`SELECT * FROM List_EmpRegistration WHERE List_EmpRegistration.ListID>-1 ORDER BY List_EmpRegistration.ListID`)
//         let disciplinesf330 = await pool.request()
//             .query(`SELECT * FROM List_DisciplineSF330 WHERE List_DisciplineSF330.ListID>-1 ORDER BY List_DisciplineSF330.ListID`)
//         let disciplinesf254 = await pool.request()
//             .query(`SELECT * FROM List_DisciplineSF254 WHERE List_DisciplineSF254.ListID>-1 ORDER BY List_DisciplineSF254.ListID`)
//         let employeestatus = await pool.request()
//             .query(`SELECT * FROM List_EmpStatus WHERE List_EmpStatus.ListID>-1 ORDER BY List_EmpStatus.ListID`)
//         let comid = await pool.request()
//             .query(`SELECT ComID,CompanyName FROM Com_Main WHERE Com_Main.ComID>-1 ORDER BY Com_Main.CompanyName`)

//         res.send([
//             {"jobtitle":jobtitle.recordset},
//             {"department":department.recordset},
//             {"prefix":prefix.recordset},
//             {"suffix":suffix.recordset},
//             {"registration":registration.recordset},
//             {"disciplinesf330":disciplinesf330.recordset},
//             {"disciplinesf254":disciplinesf254.recordset},
//             {"employeestatus":employeestatus.recordset},
//             {"comid":comid.recordset}
//         ]);

//     } catch (err) {
//         return res.status(400).send("MSSQL ERROR: " + err);
//     }
// })













module.exports = Router;
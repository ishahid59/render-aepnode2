const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const utils = require('../utils');




//************************************************************** */
// AUTHENTICATION FOR INDIVIDUAL ROUTES can be used
//************************************************************** */

// Router.use(authenticateToken); 


// Router.get('/:empid',  (req, res) => {
//     // let sql = "SELECT emp_degree.id, emp_degree.degree as str1,emp_degree.empid FROM emp_degree WHERE emp_degree.empid=? ORDER BY emp_degree.id";

//     let sql = "SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=?";

//     mysqlConnection.query(sql,req.param("empid"), (err, rows, fields) => {
//         if (!err) {
//             res.json(rows);
//         } else {
//             console.log(err);
//         }
//     });
// })



// Router.get('/all',authenticateToken,  function (req, res) {// with local auth
Router.get('/maxempdegreeid', function (req, res) {
    // console.log("from maxempid"); 
    mysqlConnection.query("SELECT MAX(ID) as maxempdegreeid FROM  emp_degree", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
        // res.send(result[0].empid);
    });

});





Router.get('/cmbempdegree',  (req, res) => {
    let sql = "SELECT list_empdegree.ListID, list_empdegree.str1,list_empdegree.str2 FROM list_empdegree WHERE list_empdegree.ListID>-1 ORDER BY list_empdegree.ListID";
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
    let sql = "SELECT list_state.ListID, list_state.str1,list_state.str2 FROM list_state WHERE list_state.ListID>-1 ORDER BY list_state.ListID";
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









// // Router.get('/maxempdegreeid', function (req, res) {
//    async function getmaxid(table, field) {
//         mysqlConnection.query("SELECT MAX(" + field + ") as mid FROM  " + table + "", (err, result) => {
//             if (err) {
//                 console.log(err)
//             }
//             //res.send(result[0].maxid);
//           console.log("test10 "+result[0].mid);
//               return result[0].mid;
//         })
        
//     }


    
// EmpDegree get for Edit need to rename
 Router.get('/:id',  (req, res) => {
    // let sql = "SELECT emp_degree.id, emp_degree.degree as str1,emp_degree.empid FROM emp_degree WHERE emp_degree.empid=? ORDER BY emp_degree.id";
//    let x= getmaxid(5,5);
    let sql = "SELECT * FROM emp_degree WHERE emp_degree.ID=?";

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
Router.get('/empdegreedetails/:id', async (req, res) => {
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
        
        `SELECT list_empdegree.Str1 AS disDegree, emp_degree.DegreeField, emp_degree.Institution, emp_degree.YearDegreeEarned, list_state.Str1 AS disState,  \
        list_country.Str1 AS disCountry, emp_degree.ID, emp_degree.Notes, emp_degree.Degree, emp_degree.DegState, emp_degree.Country,  \
        emp_degree.EmpID  \
        FROM emp_degree INNER JOIN  \
        list_empdegree ON emp_degree.Degree = list_empdegree.ListID INNER JOIN  \
        list_state ON emp_degree.DegState = list_state.ListID INNER JOIN  \
        list_country ON emp_degree.Country = list_country.ListID  \
        WHERE (emp_degree.ID = ?)`  ,  
        
        
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











// // EmpDegree get for Detail need to rename
// Router.get('/empdegreedetails/:id',  (req, res) => {
//     // let sql = "SELECT emp_degree.id, emp_degree.degree as str1,emp_degree.empid FROM emp_degree WHERE emp_degree.empid=? ORDER BY emp_degree.id";

//     let sql = "SELECT emp_degree.EmpID, list_empdegree.Str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.Degree=list_empdegree.ListID WHERE emp_degree.EmpID=?";

//     mysqlConnection.query(sql,req.param("id"), (err, rows, fields) => {
//         if (!err) {
//             res.json(rows);
//         } else {
//             console.log(err);
//         }
//     });
// })







// // EDIT GET EmpDegree
// Router.get('/:id', function (req, res) {
//     // mysqlConnection.query("SELECT * FROM emp_degree WHERE emp_degree.EmpID=?", req.param('empid'), (err, rows, fields) => {
//         mysqlConnection.query("SELECT * FROM emp_degree WHERE emp_degree.ID=?", req.param('empid'), (err, rows, fields) => {

//         if (!err) {
//             res.send(rows);
//             console.log(rows[0]);
//             // res.render("Hello.ejs", {name:rows});
//         } else {
//             console.log(err);
//         }
//     });
// });




// UPDATE
Router.post('/update', [
    // check('degree', "Degree cannot be empty.").notEmpty(),
    check('degree', "Degree cannot be empty.").isInt({ min:1}),
    // check('degree', "Degree cannot be empty.").isInt({ min:1, max: 2000}),
    // check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
],
    function (req, res) {
         const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let post3 = req.body;


        let query = `UPDATE emp_degree  SET ? WHERE ID=?`;
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
        // check('lastname',"Lastname cannot be empty.").notEmpty(),
        // check('firstname',"Firstname cannot be empty.").notEmpty()
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
        await utils.maxid("emp_degree","ID")
        .then(data => {
            maxid = data;
        });


    req.body.id = maxid + 1;
    let postdata = req.body; 

    mysqlConnection.query('INSERT INTO emp_degree SET ?', postdata, function (error, results, fields) {
        if (!error) {
            console.log("success");
            res.send(results);
        } else {
            console.log(error);
        }
    });
});





// DELETE Emp Degree
Router.delete('/:empdegreeid', function (req, res) {
    mysqlConnection.query("DELETE FROM emp_degree WHERE ID=?", req.param('empdegreeid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows);
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
    Router.post('/empdegree-angular-datatable', async function (req, res) { // sending empid in body now

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
            0: 'empid',
            1: 'Degree',
            2: 'DegreeField',
            3: 'YearDegreeEarned',
            4: 'Institution',
            5: 'DegState',
            6: 'Country',
         }
         
    
        var totalData = 0;
        var totalbeforefilter = 0;
        var totalFiltered = 0;
        var col = columns[ordercol];// to get name of order col not index
    
        // For Getting the TotalData without Filter
        // let sql1 = `SELECT * FROM emp_degree WHERE emp_degree.id>0`;        
        //**2023 Chils table queries for total before filter should be like this */
        // let sql1 = `SELECT * FROM emp_degree WHERE emp_degree.EmpID=`+ req.body.empid + ``;//2023
        // mysqlConnection.query(sql1, (err, rows, fields) => {
        //     totalData = rows.length;
        //     totalbeforefilter = rows.length;
        // });

 

        // ** After using pool conn the mysql order has changed. So to keep the order async await is used
        // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
        // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

        await utils.totaldata("SELECT COUNT(ID) AS total FROM emp_degree WHERE emp_degree.EmpID="+ req.body.empid)
        .then(data => {
            totalData = data;
        });
        // const value = await totaldata();


    
        // let sql = `SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
        // list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
        // emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
        // INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0`

        // let sql = "SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=?"
        // let sql = "SELECT emp_degree.ID, emp_degree.EmpID, emp_degree.DegreeField, list_empdegree.Str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.Degree=list_empdegree.ListID WHERE emp_degree.EmpID="+req.body.empid;
        
        let sql = `SELECT list_empdegree.str1 AS disDegree, emp_degree.DegreeField, emp_degree.Institution, emp_degree.YearDegreeEarned, list_state.str1 AS disState,  \
        list_country.Str1 AS disCountry, emp_degree.ID, emp_degree.Notes, emp_degree.Degree, emp_degree.DegState, emp_degree.Country,  \
        emp_degree.EmpID  \
        FROM emp_degree INNER JOIN  \
        list_empdegree ON emp_degree.Degree = list_empdegree.ListID INNER JOIN  \
        list_state ON emp_degree.DegState = list_state.ListID INNER JOIN  \
        list_country ON emp_degree.Country = list_country.ListID  \
        WHERE (emp_degree.EmpID = `+ req.body.empid + `)`
  
// console.log(sql);
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
            sql = sql + ` AND list_empdegree.str1 LIKE '%${search}%'`;
            
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
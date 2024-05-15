
const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const mysql = require('mysql');
const utils = require('../utils');
// authenticateToken can be used locally(on each function) or globally in server for all mod
// const authenticateToken= require('../middleware/authenticateToken');



Router.get('/cmbofficecategory',  (req, res) => {
    let sql = "SELECT list_comocategory.ListID, list_comocategory.Str1 FROM list_comocategory WHERE list_comocategory.ListID>-1 ORDER BY list_comocategory.ListID";
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

Router.get('/cmbtypeofownership',  (req, res) => {
    let sql = "SELECT list_comtownership.ListID, list_comtownership.Str1 FROM list_comtownership WHERE list_comtownership.ListID>-1 ORDER BY list_comtownership.ListID";
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


    // Used To check for duplicateemployeeid()
    Router.get('/duplicateproposalno/:proposalno', function (req, res) {
        // console.log("from maxempid"); 
        // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
        // mysqlConnection.query("SELECT *  FROM  emp_main", (err, result) => {
        // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmployeeID=?", req.param('empid'), (err, rows) => {
            // SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total
            var filter = [req.param('proposalno')];
            // mysqlConnection.query("SELECT COUNT(*) AS employeeidcount FROM pro_team  WHERE pro_team.EmpID=?", req.param('empid'), (err, rows) => {
            mysqlConnection.query("SELECT COUNT(*) AS proposalnocount FROM proposal_main  WHERE proposal_main.ProposalNo=? " , filter, (err, rows, fields) => {
    
            if (err) {
                console.log(err)
            }
            res.send(rows);//note: cannot get result[0].employeeidcount here. But can get value in angular from 'rows'
            // res.send(result[0].empid);
            // console.log("from maxempid"); 
        });


     });




// 20231114 Corected for Migrated(mssql to mysql) database using for search
// DETAIL PAGE used in ANGULAR 2022 to get jobtitle name instead of id
Router.get('/proposaldetails/:proposalid', function (req, res) {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
    mysqlConnection.query(

     `SELECT DISTINCT proposal_main.ProposalID, proposal_main.ProjectName, proposal_main.ProposalNo,proposal_main.ProjectName, 
     proposal_main.DebriefingReceived, proposal_main.EstimatedFee, proposal_main.PresentationDate, proposal_main.PresentationTime, 
     proposal_main.ProjectAwardStatus, proposal_main.ProjectRole, proposal_main.ProposalDueDate, proposal_main.ProposalDueTime, 
     proposal_main.PublicNoticeDate, proposal_main.SecondaryProjectType, proposal_main.SolicitationNo, proposal_main.SOQDueDate, proposal_main.SOQDueTime, proposal_main.TechnicalLead, 
    list_projecttype.Str1 AS ProjectType, list_proocategory.Str1 AS OwnerCategory,list_proposalstatus.Str1 AS Status,list_projectawardstatus.Str1 AS ProjectAwardStatus, cao_main.Name AS Owner, 
    emp_main.EmployeeID AS TechnicalLead, emp_main_1.EmployeeID AS ProposalCoordinator
    FROM proposal_main LEFT JOIN 
    list_projecttype ON proposal_main.ProjectType = list_projecttype.ListID LEFT JOIN 
    list_proocategory ON proposal_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN 
    list_proposalstatus ON proposal_main.Status = list_proposalstatus.ListID LEFT OUTER JOIN 
    list_projectawardstatus ON proposal_main.ProjectAwardStatus = list_projectawardstatus.ListID LEFT OUTER JOIN 
    cao_main ON proposal_main.Owner = cao_main.CAOID LEFT OUTER JOIN 
    emp_main ON proposal_main.TechnicalLead = emp_main.EmpID LEFT OUTER JOIN 
    emp_main AS emp_main_1 ON proposal_main.ProposalCoordinator = emp_main_1.EmpID 
    WHERE (proposal_main.ProposalID = ?)`   
    ,
    
     req.param('proposalid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});



// EDIT GET
Router.get('/:proposalid', function (req, res) {
    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
   

    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.EmpID=?", req.param('empid'), (err, rows, fields) => {
         mysqlConnection.query("SELECT * FROM proposal_main WHERE proposal_main.ProposalID=?", req.param('proposalid'), (err, rows, fields) => {
        //mysqlConnection.query("SELECT * FROM pro_main WHERE pro_main.ProjectID=?", req.params.projectid, (err, rows, fields) => {

//    console.log (req.param('empid'));    
        if (!err) {
            res.send(rows[0]);
            console.log(rows[0]);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});



// INSERT
// Router.post('/', function (req, res) {
    // With express-Validator   
    Router.post('/',[ 
        check('projectname',"Project Name cannot be empty.").notEmpty(),
        check('proposalno',"Proposal N0. cannot be empty.").notEmpty(),

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
        await utils.maxid("proposal_main","ProposalID")
        .then(data => {
            maxid = data;
        });


    // console.log(req.body);
    // return
    // console.log(req.body.hiredate);
           req.body.proposalid = maxid + 1;
           let postdata = req.body; 


    // if(req.body.hiredate==null){
    //     req.body.hiredate="0000-00-00";
    // }



    // Create EmployeeID
    //******************************* */
    // let fname = (req.body.firstname).charAt(0);
    // req.body.employeeid=req.body.lastname +fname+req.body.middlei; // added 2023

    // console.log("test9 "+req.body.empid);

    //  // Calculte maxid   
    //  //************************** */
    // var  maxid;
    // mysqlConnection.query("SELECT MAX(EmpID) as empid FROM  emp_main", (err, result) => {
    //     if (err) {
    //         console.log(err)
    //     }
    //     res.send(result);
    //     // console.log(result[0].empid);
    //     // var maxid;
    //     maxid = result[0].empid;
    //     // console.log("test8  "+maxid);
    //     // req.body.empid = maxid+1;  
    // });
    // // return;  
    // req.body.empid = maxid+1; 
    // // req.body.empid = result[0].empid + 1;  
   
    // //  req.body.empid = 114;  //FOR TEST 




    mysqlConnection.query('INSERT INTO proposal_main SET ?', postdata, function (error, results, fields) {
        if (!error) {
            console.log("success");
            res.send(results);
        } else {
            console.log(error);
        }
    });
});




// UPDATE
Router.post('/update/', [
    check('projectname',"Project Name cannot be empty.").notEmpty(),
    check('proposalno',"Proposal N0. cannot be empty.").notEmpty(),
],
    function (req, res) {
        // console.log("test3 "+req.body.employeeid);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        //Consulant Checked send 1, but unchecked sends null so be manually put in 0
        // if (req.body.consultant == null) {
        //     req.body.consultant = 0;
        // }
        // if (req.body.parentcompany == null) {
        //     req.body.parentcompany = 0;
        // }
        // if (req.body.iecompany == null) {
        //     req.body.iecompany = 0;
        // }
        // console.log("test3 "+req.body.employeeid);
        let post3 = req.body;

        // let query = `UPDATE emp_main  SET ? WHERE empid=?`;
        let query = `UPDATE proposal_main  SET ? WHERE ProposalID=?`;
        mysqlConnection.query(query, [post3, req.body.proposalid], (err, rows, fields) => {
            if (!err) {
                res.send(rows);
                console.log(post3);
            } else {
                // console.log("err");
                console.log(err);
            }
        });
    });






// DELETE
Router.delete('/:proposalid', function (req, res) {

    mysqlConnection.query("DELETE FROM proposal_main WHERE ProposalID=?", req.param('proposalid'), (err, rows, fields) => {
  
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});









// 2024 USING THIS FOR ANGULAR DATATABLE 2024(count records used in one query for speed)
// https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
Router.post('/angular-datatable', async function (req, res) {


    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    // let ordercol = req.body['order[0][column]'];
    let ordercol = req.body.order[0].column;//changed 20221130 for angular
    // let orderdir =  req.body['order[0][dir]'];
    let orderdir = req.body.order[0].dir;//changed 20221130 for angular
    let search = req.body.search.value;
    // let search = req.body['search[value]'];

    var columns = {
        // 0: 'CompanyName',
        // 1: 'State',
        // 2: 'Country',
        // 3: 'IECompany',
        

        //** This is needed for order by to work and exact field name should be used
        0: 'ProposalNo',
        1: 'ProjectName',
        // 2: 'PrimaryProjectType',
        2: 'ProjectType',
        3: 'Owner',
        4: 'OwnerCategory',



    }
    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index

    // // For Getting the TotalData without Filter
    // let sql1 = `SELECT * FROM pro_main WHERE pro_main.ProjectID>0`;
    // mysqlConnection.query(sql1, (err, rows, fields) => {
    //     totalData = rows.length;
    //     // console.log("totalData2 :: " + rows.length);
    //     // totalbeforefilter = rows.length; // disabled 2023
    // });
    // ** After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

    // await test().then(json => {console.log(json)});
    // await utils.totaldata("SELECT * FROM pro_main WHERE pro_main.ProjectID>0").then(data => { totalData = data; });
    // await utils.totaldata("SELECT COUNT(ProjectID) AS total FROM pro_main WHERE pro_main.ProjectID>0").then(data => {totalData = data;});
    // const value = await totaldata();

        // 2024 Avoid using multiple sql for speed
        // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
        // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
        // https://stackoverflow.com/questions/15710930/mysql-select-distinct-count
        
        
        let from = ` FROM proposal_main 
        WHERE (proposal_main.ProposalID > 0) `

        // let from = ` FROM pro_main LEFT OUTER JOIN
        // list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
        // list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
        // list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
        // list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
        // proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
        // cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
        // cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
        // com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
        // emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
        // pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
        // pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
        // WHERE (pro_main.ProjectID > 0) `


        //**Note: LINE   "cao_main AS cao_main_1 ON pro_main.Client = cao_main.CAOID LEFT OUTER JOIN "
        // is changed to "cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN "
        // 2024 https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
        // 2024 https://stackoverflow.com/questions/15710930/mysql-select-distinct-count

        var sqlWhere = '';
        let sql =
        // `SELECT DISTINCT com_main.CompanyName,
        // com_main.State,
        // com_main.Country,
        // com_main.IECompany,
        // (select count(*) from com_main WHERE com_main.ComID>0) as totaldata,
        // (select count(DISTINCT com_main.ComID) ${from} ${sqlWhere}) as totalfiltered 
        // FROM com_main 
        // WHERE (com_main.ComID > 0)`


        `SELECT DISTINCT proposal_main.ProposalID, proposal_main.ProposalNo,proposal_main.ProjectName, 
        list_projecttype.Str1 AS ProjectType, list_proocategory.Str1 AS OwnerCategory, cao_main.Name AS Owner, 
        (select count(*) from proposal_main WHERE proposal_main.ProposalID>0) as totaldata, 
        (select count(DISTINCT proposal_main.ProposalID) ${from} ${sqlWhere}) as totalfiltered 
        FROM proposal_main LEFT JOIN 
        list_projecttype ON proposal_main.ProjectType = list_projecttype.ListID LEFT JOIN 
        list_proocategory ON proposal_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN 
        cao_main ON proposal_main.Owner = cao_main.CAOID
        WHERE (proposal_main.ProposalID > 0)`

        // list_proprole.Str1 AS ProjectRole, pro_main.AwardYear, pro_main.ProjectNo, list_proocategory.Str1 AS OwnerCategory, 
        // com_main.CompanyName AS ComID, list_projecttype.Str1 AS PrimaryProjectType, pro_main.SecondaryProjectType, cao_main.Name AS Owner, 
        // cao_main_1.Name AS Client, pro_main.ProjectAgreementNo, emp_main.EmployeeID AS ProjectManager, list_prostatus.Str1 AS ProjectStatus, 
        // proposal_main.ProposalNo AS ProposalID, pro_main.ProjectID,
        // (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata,
        // (select count(DISTINCT pro_main.ProjectID) ${from} ${sqlWhere}) as totalfiltered 
        // FROM pro_main LEFT OUTER JOIN
        // list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
        // list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
        // list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
        // list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
        // proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
        // cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
        // cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
        // com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
        // emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
        // pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
        // pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
        // WHERE (pro_main.ProjectID > 0)`




    if (search == "") {
        // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

        // 2024 edited for showing all records
        if (limit==-1) {
            sql = sql + ` order by ${col} ${orderdir} `;
        } else {
            sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        }
        // sql = sql + ` order by ${col} ${orderdir} `;
        mysqlConnection.query(sql, (err, rows, fields) => {

            if (!err) {
                //2024
                if (rows.length > 0) {
                    totalData = rows[0].totaldata;
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

    } else {

        sqlWhere = sqlWhere + ` AND proposal_main.ProjectName LIKE '%${search}%'`;
        // sqlWhere = sqlWhere + ` OR pro_main.ProjectName LIKE '%${search}%'`;
        // sqlWhere = sqlWhere + ` OR list_projecttype.Str1 LIKE '%${search}%'`;
        // sqlWhere = sqlWhere + ` OR pro_main.AwardYear LIKE '%${search}%'`;
        // sqlWhere = sqlWhere + ` OR cao_main.Name LIKE '%${search}%'`;


        sql =
        // `SELECT DISTINCT pro_main.ProjectName, list_proprole.Str1 AS ProjectRole, pro_main.AwardYear, pro_main.ProjectNo, list_proocategory.Str1 AS OwnerCategory, 
        // com_main.CompanyName AS ComID, list_projecttype.Str1 AS PrimaryProjectType, pro_main.SecondaryProjectType, cao_main.Name AS Owner, 
        // cao_main_1.Name AS Client, pro_main.ProjectAgreementNo, emp_main.EmployeeID AS ProjectManager, list_prostatus.Str1 AS ProjectStatus, 
        // proposal_main.ProposalNo AS ProposalID, pro_main.ProjectID,
        // (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata,
        // (select count(DISTINCT pro_main.ProjectID) ${from} ${sqlWhere}) as totalfiltered 
        // FROM pro_main LEFT OUTER JOIN
        // list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
        // list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
        // list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
        // list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
        // proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
        // cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
        // cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
        // com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
        // emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
        // pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
        // pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
        // WHERE (pro_main.ProjectID > 0)`

        // `SELECT DISTINCT com_main.CompanyName,
        // com_main.State,
        // com_main.Country,
        // com_main.IECompany,
        // (select count(*) from com_main WHERE com_main.ComID>0) as totaldata,
        // (select count(DISTINCT com_main.ComID) ${from} ${sqlWhere}) as totalfiltered 
        // FROM com_main 
        // WHERE (com_main.ComID > 0)`

        `SELECT DISTINCT proposal_main.ProposalID, proposal_main.ProposalNo,proposal_main.ProjectName, 
        list_projecttype.Str1 AS ProjectType, list_proocategory.Str1 AS OwnerCategory, cao_main.Name AS Owner, 
        (select count(*) from proposal_main WHERE proposal_main.ProposalID>0) as totaldata, 
        (select count(DISTINCT proposal_main.ProposalID) ${from} ${sqlWhere}) as totalfiltered 
        FROM proposal_main LEFT JOIN 
        list_projecttype ON proposal_main.ProjectType = list_projecttype.ListID LEFT JOIN 
        list_proocategory ON proposal_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN 
        cao_main ON proposal_main.Owner = cao_main.CAOID
        WHERE (proposal_main.ProposalID > 0)`


    // //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
    // So total filtered record is calculated before applying limit and
    // let totalbeforelimitandoffset = 0;
    // let sql3 = sql + ` order by ${col} ${orderdir} `;
    // mysqlConnection.query(sql3, (err, rows3, fields) => {
    //     totalbeforelimitandoffset = rows3.length;
    //     // console.log("testtotal :: " + sql3);
    // });

    // ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
    // await utils.totalbeforelimtandoff(sql3).then(data => {totalbeforelimitandoffset = data;});


    // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
    // 2024 edited for showing all records
    if (limit==-1) {
        sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
    } else {
        sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
    }
        mysqlConnection.query(sql, (err, rows, fields) => {
            if (!err) {

                // totalFiltered = totalbeforelimitandoffset
                if (rows.length > 0) {
                    totalData = rows[0].totaldata;
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
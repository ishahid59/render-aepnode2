const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
const utils = require('../utils');



// DETAIL PAGE used in ANGULAR 2022 to get jobtitle name instead of id
Router.get('/propdstextdetails/:projectid', async (req, res) => {
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


        // `SELECT pro_address.ID, pro_address.AddressLine1, pro_address.AddressLine2, pro_address.ProjectLocation,  pro_address.Zipcode, pro_address.City,  pro_address.Notes, pro_address.ProjectID,
        // list_state.str1 AS disState, list_country.Str1 AS disCountry  
        // FROM  pro_address LEFT OUTER JOIN
        // list_state ON pro_address.State = list_state.ListID LEFT OUTER JOIN
        // list_country ON pro_address.Country = list_country.ListID 
        // WHERE pro_address.ProjectID = ?`    ,  

        `SELECT * From pro_pdstext WHERE pro_pdstext.ProjectID = ?`    ,
         


     req.param('projectid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
            // console.log(rows[0]);
            // res.render("Hello.ejs", {name:rows});
        } else {
            console.log(err);
        }
    });
});


Router.get('/maxpropdstextid', function (req, res) {
    // console.log("from maxempid"); 
    mysqlConnection.query("SELECT MAX(ID) as maxproaddressid FROM  pro_pdstext", (err, result) => {
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
            `SELECT *  FROM pro_pdstext WHERE pro_pdstext.ProjectID = ?`    ,  


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

    let sql = "SELECT * FROM pro_pdstext WHERE pro_pdstext.ProjectID=?";

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
    // check('projectlocation', "Project Location cannot be empty.").notEmpty(),
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

        let query = `UPDATE pro_pdstext  SET ? WHERE ID=?`;
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
        // check('projectlocation', "Project Location cannot be empty.").notEmpty(),
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
        await utils.maxid("pro_pdstext","ID")
        .then(data => {
            maxid = data;
        });


    req.body.id = maxid + 1;
    let postdata = req.body; 

    mysqlConnection.query('INSERT INTO pro_pdstext SET ?', postdata, function (error, results, fields) {
        if (!error) {
            console.log("success");
            res.send(results);
        } else {
            console.log(error);
        }
    });
});





// DELETE pro_address
Router.delete('/:projectid', function (req, res) {
    mysqlConnection.query("DELETE FROM pro_pdstext WHERE ProjectID=?", req.param('projectid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    });
});











// Router.post('/search/angular-datatable',authenticateToken, function (req, res) { // with local auth
// Router.post('/empdegree-angular-datatable/:empid', function (req, res) {
    Router.get('/proaddressdetails/:projectid', async (req, res) => { // sending empid in body now

    // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
        mysqlConnection.query(

            // ID
            // AddressLine1
            // AddressLine2
            // ProjectLocation
            // City
            // State
            // Zipcode
            // Country
            // Notes
            // ProjectID
            
            `SELECT pro_address.ID, pro_address.AddressLine1, pro_address.AddressLine2, pro_address.ProjectLocation, pro_address.City,  pro_address.Zipcode,  pro_address.Notes, pro_address.ProjectID,
            list_state.str1 AS disState, list_country.Str1 AS disCountry  
            FROM  pro_address LEFT OUTER JOIN
            list_state ON pro_address.State = list_state.ListID LEFT OUTER JOIN
            list_country ON pro_address.Country = list_country.ListID 
            WHERE pro_address.ProjectID = ?`    ,  
    
    
         req.param('projectid'), (err, rows, fields) => {
            if (!err) {
                res.send(rows[0]);
                // res.render("Hello.ejs", {name:rows});
            } else {
                console.log(err);
            }
        });
    });





// 2025
// ******************************************************************************************************
// // USING THIS FOR pro_pdstext_search
// **************************************************************************************************** */

Router.post('/search/angular-datatable', async function (req, res) {

    
    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    // let ordercol = req.body['order[0][column]'];
    let ordercol = req.body.order[0].column;//changed 20221130 for angular
    // let orderdir =  req.body['order[0][dir]'];
    let orderdir = req.body.order[0].dir;//changed 20221130 for angular
    let search = req.body.search.value;
    // let search = req.body['search[value]'];

    // let jobtitle = req.body.jobtitle;
    // let department = req.body.department;
    // let registration = req.body.registration;
    // let disciplinesf254 = req.body.disciplinesf254;
    // let disciplinesf330 = req.body.disciplinesf330;
    // let employeestatus = req.body.employeestatus;
    // let comid = req.body.comid;
    // let empdegree = req.body.empdegree;
    // let emptraining = req.body.emptraining;
    // let owner = req.body.owner;
    // let client = req.body.client;
    // let proocategory = req.body.proocategory;
    // let projecttype = req.body.projecttype;
    // let empprojectrole = req.body.empprojectrole;


    let projectid = req.body.projectid;
    let pdsprojectname = req.body.pdsprojectname;
    let pdsprojectlocation = req.body.pdsprojectlocation;
    let ownercontact = req.body.ownercontact;
    let clientcontact = req.body.clientcontact;
    let description = req.body.description;
    let startenddates = req.body.startenddates;
    let contractamount = req.body.contractAmount;
    let pdsprojectdescription = req.body.pdsprojectdescription;
    let notes = req.body.notes;

    let showallrows = req.body.showallrows;







    //** This is needed for order by to work and exact field name should be used
    var columns = {

        //** This is needed for order by to work and exact field name should be used
        // 0: 'ProjectID',
        // 1: 'OwnerContact',
        // 2: 'ClientContact',
        // 3: 'StartEndDates',
        // 4: 'ContractAmount',
        // 5: 'Notes',

        0: 'ProjectID',
        1: 'PdsProjectName',
        2: 'PdsProjectLocation',
        3: 'OwnerContact',
        4: 'ClientContact',
        5: 'StartEndDates',
        6: 'ContractAmount',
        7: 'PdsProjectDescription',
        8: 'Notes',

    }


    var totalData = 0;
    // var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index


    var sqlWhere = '';
    filterpresent=false;


    // if (registration > 0) {
    if (projectid != "") {
        sqlWhere = sqlWhere + ` AND pro_main.ProjectID LIKE '%${projectid}%' `;
        filterpresent = true;
    }
    if (pdsprojectname != "") {
        sqlWhere = sqlWhere + ` AND pro_pdstext.PdsProjectName LIKE '%${pdsprojectname}%' `;
        filterpresent = true;
    }
    if (pdsprojectlocation != "") {
        sqlWhere = sqlWhere + ` AND pro_pdstext.PdsProjectLocation LIKE '%${pdsprojectlocation}%' `;
        filterpresent = true;
    }
    if (ownercontact != "") {
        // sqlWhere = sqlWhere + ` AND emp_main.Registration = ${registration}`
        sqlWhere = sqlWhere + ` AND pro_pdstext.OwnerContact LIKE '%${ownercontact}%' `;
        filterpresent = true;
    }
    if (clientcontact != "") {
        sqlWhere = sqlWhere + ` AND pro_pdstext.ClientContact LIKE '%${clientcontact}%' `;
        filterpresent = true;
    }
    // if (description != "") {
    //     sqlWhere = sqlWhere + ` AND pro_descriptions.Description LIKE '%${description}%' `;
    //     filterpresent = true;
    // }
    if (startenddates != "") {
        sqlWhere = sqlWhere + ` AND pro_pdstext.StartEndDates LIKE '%${startenddates}%' `;
        filterpresent = true;
    }
    if (contractamount != "") {
        sqlWhere = sqlWhere + ` AND pro_pdstext.ContractAmount LIKE '%${contractamount}%' `;
        filterpresent = true;
    }
    if (pdsprojectdescription != "") {
        sqlWhere = sqlWhere + ` AND pro_pdstext.PdsProjectDescription LIKE '%${pdsprojectdescription}%' `;
        filterpresent = true;
    }
    if (notes != "") {
        sqlWhere = sqlWhere + ` AND emp_resumetext.Notes LIKE '%${notes}%' `;
        filterpresent = true;
    }

        // used to show/hide all emp rows using join controlled by checkbox in frontend
        var join = '';

        if (showallrows) {
            join = ' LEFT OUTER JOIN '
        } else {
            join = ' INNER JOIN ';
            filterpresent = true;
    
        }

    // 2024 Avoid using multiple sql for speed
    // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
    
let from = 
// ` FROM emp_main LEFT OUTER JOIN
//     list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
//     list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
//     list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
//     list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
//     list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
//     list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
//     list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
//     list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
//     com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
//     emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
//     emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
//     pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
//     pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0 `

// ` FROM emp_main LEFT OUTER JOIN emp_resumetext ON emp_main.EmpID = emp_resumetext.EmpID WHERE emp_main.EmpID>0 `

// ${join} used to show/hide all emp rows using join controlled by checkbox in frontend
` FROM pro_main ${join} pro_pdstext ON pro_main.ProjectID = pro_pdstext.ProjectID WHERE pro_main.ProjectID>0 `

    
    // (select count(*) from emp_main WHERE emp_main.EmpID>0 ${sqlWhere}) as totalfiltered 

    // https://stackoverflow.com/questions/33889922/how-to-get-the-number-of-total-results-when-there-is-limit-in-query
    // https://stackoverflow.com/questions/15710930/mysql-select-distinct-count
    let sql =
    // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
    //     list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
    //     list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
    //     emp_main.ExpWithOtherFirm, 
    //     (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
    //     (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
    //     FROM emp_main LEFT OUTER JOIN
    //     list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
    //     list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
    //     list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
    //     list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
    //     list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
    //     list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
    //     list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
    //     list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
    //     com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
    //     emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
    //     emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
    //     pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
    //     pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0 `

    // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_resumetext.Education,emp_resumetext.Registration, 
    // emp_resumetext.Affiliations, emp_resumetext.Employment, emp_resumetext.Experience, 
    // (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
    // (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
    // FROM emp_main LEFT OUTER JOIN emp_resumetext ON emp_main.EmpID = emp_resumetext.EmpID WHERE emp_main.EmpID>0 `

    // `SELECT DISTINCT pro_main.ProjectID, pro_main.ProjectNo, pro_pdstext.OwnerContact,pro_pdstext.ClientContact, 
    // pro_pdstext.StartEndDates, pro_pdstext.ContractAmount, pro_pdstext.Notes, 
    // (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata, 
    // (select count(DISTINCT pro_main.ProjectID) ${from} ${sqlWhere}) as totalfiltered 
    // FROM pro_main LEFT OUTER JOIN pro_pdstext ON pro_main.ProjectID = pro_pdstext.ProjectID WHERE pro_main.ProjectID>0 `
    
    // ${join} used to show/hide all emp rows using join controlled by checkbox in frontend


    // `SELECT DISTINCT pro_main.ProjectID, pro_main.ProjectNo, pro_pdstext.OwnerContact,pro_pdstext.ClientContact, 
    // pro_pdstext.StartEndDates, pro_pdstext.ContractAmount, pro_pdstext.Notes, pro_descriptions.Description, 
    // (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata, 
    // (select count(DISTINCT pro_main.ProjectID) ${from} ${sqlWhere}) as totalfiltered 
    // FROM pro_main LEFT OUTER JOIN pro_pdstext ON pro_main.ProjectID = pro_pdstext.ProjectID  LEFT OUTER JOIN 
    // pro_descriptions ON pro_main.ProjectID = pro_descriptions.ProjectID 
    // WHERE pro_main.ProjectID>0 ` // AND pro_descriptions.ItemName=1    `

    // ${join} used to show/hide all emp rows using join controlled by checkbox in frontend

    `SELECT DISTINCT pro_main.ProjectID, pro_main.ProjectNo, pro_pdstext.PdsProjectName,pro_pdstext.PdsProjectLocation,
    pro_pdstext.PdsProjectDescription, pro_pdstext.OwnerContact,pro_pdstext.ClientContact, 
    pro_pdstext.StartEndDates, pro_pdstext.ContractAmount, pro_pdstext.Notes, 
    (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata, 
    (select count(DISTINCT pro_main.ProjectID) ${from} ${sqlWhere}) as totalfiltered 
    FROM pro_main ${join} pro_pdstext ON pro_main.ProjectID = pro_pdstext.ProjectID  
    WHERE pro_main.ProjectID>0 ` 

if (search == "") {
    // sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;

    // 2024 edited for showing all records
    if (limit == -1) {
        sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
    } else {
        sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
    }

    console.log(sql)
    // sql = sql + ` order by ${col} ${orderdir} `;
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {

            if (!filterpresent) {
                //2023 important. if no filter is present totalFiltered remains totalData in table
                // totalFiltered = totalData;
                if (rows.length>0) {
                    totalData = rows[0].totaldata;
                }
                totalFiltered = totalData;
            }  
            else {
                if (rows.length>0) {
                    totalData = rows[0].totaldata;
                }
                if (rows.length>0) {
                    totalFiltered = rows[0].totalfiltered;
                }
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


    // // sqlWhere = sqlWhere + ` AND Firstname LIKE '%${search}%'`;
    // // sqlWhere = sqlWhere + ` OR Lastname LIKE '%${search}%'`;
    // sqlWhere = sqlWhere + ` AND emp_main.EmployeeID LIKE '%${search}%'`;        
    // sqlWhere = sqlWhere + ` OR list_empjobtitle.str1 LIKE '%${search}%'`;
    // sqlWhere = sqlWhere + ` OR list_empregistration.str1 LIKE '%${search}%'`;
    // sqlWhere = sqlWhere + ` OR list_department.Str1 LIKE '%${search}%'`;
    // sqlWhere = sqlWhere + ` OR emp_main.HireDate LIKE '%${search}%'`;

    sqlWhere = sqlWhere + ` AND pro_main.ProjectNo LIKE '%${search}%'`; 
    sqlWhere = sqlWhere + ` OR pro_pdstext.PdsProjectName LIKE '%${search}%'`;        
    sqlWhere = sqlWhere + ` OR pro_pdstext.PdsProjectLocation LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR pro_pdstext.OwnerContact LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR pro_pdstext.ClientContact LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR pro_pdstext.StartEndDates LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR pro_pdstext.ContractAmount LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR pro_pdstext.PdsProjectDescription LIKE '%${search}%'`;
    sqlWhere = sqlWhere + ` OR pro_pdstext.Notes LIKE '%${search}%'`;


    sql =
    // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_main.Firstname, emp_main.Lastname, com_main.CompanyName AS ComID, 
    //     list_empjobtitle.Str1 AS JobTitle, list_department.Str1 AS Department, list_empregistration.Str1 AS Registration, emp_main.HireDate, 
    //     list_disciplinesf254.Str1 AS DisciplineSF254, list_disciplinesf330.Str2 AS DisciplineSF330, list_empstatus.Str1 AS EmployeeStatus, 
    //     emp_main.ExpWithOtherFirm, 
    //     (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
    //     (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
    //     FROM emp_main LEFT OUTER JOIN
    //     list_empregistration ON emp_main.Registration = list_empregistration.ListID LEFT OUTER JOIN
    //     list_disciplinesf254 ON emp_main.DisciplineSF254 = list_disciplinesf254.ListID LEFT OUTER JOIN
    //     list_disciplinesf330 ON emp_main.DisciplineSF330 = list_disciplinesf330.ListID LEFT OUTER JOIN
    //     list_empjobtitle ON emp_main.JobTitle = list_empjobtitle.ListID LEFT OUTER JOIN
    //     list_department ON emp_main.Department = list_department.ListID LEFT OUTER JOIN
    //     list_empstatus ON emp_main.EmployeeStatus = list_empstatus.ListID LEFT OUTER JOIN
    //     list_empprefix ON emp_main.Prefix = list_empprefix.ListID LEFT OUTER JOIN
    //     list_empsuffix ON emp_main.Suffix = list_empsuffix.ListID LEFT OUTER JOIN
    //     com_main ON emp_main.ComID = com_main.ComID LEFT OUTER JOIN
    //     emp_degree ON emp_main.EmpID = emp_degree.EmpID LEFT OUTER JOIN
    //     emp_training ON emp_main.EmpID = emp_training.EmpID LEFT OUTER JOIN
    //     pro_team ON emp_main.EmpID = pro_team.EmpID LEFT OUTER JOIN
    //     pro_main ON pro_team.ProjectID = pro_main.ProjectID WHERE emp_main.EmpID>0`

 

        // `SELECT DISTINCT emp_main.EmpID, emp_main.EmployeeID, emp_resumetext.Education,emp_resumetext.Registration, 
        // emp_resumetext.Affiliations,emp_resumetext.Experience, emp_resumetext.Employment,
        // (select count(*) from emp_main WHERE emp_main.EmpID>0) as totaldata, 
        // (select count(DISTINCT emp_main.EmpID) ${from} ${sqlWhere}) as totalfiltered 
        // FROM emp_main LEFT OUTER JOIN emp_resumetext ON emp_main.EmpID = emp_resumetext.EmpID WHERE emp_main.EmpID>0 `

        // `SELECT DISTINCT pro_main.ProjectID, pro_main.ProjectNo, pro_pdstext.OwnerContact,pro_pdstext.ClientContact, 
        // pro_pdstext.StartEndDates, pro_pdstext.ContractAmount, pro_pdstext.Notes, 
        // (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata, 
        // (select count(DISTINCT pro_main.ProjectID) ${from} ${sqlWhere}) as totalfiltered 
        // FROM pro_main LEFT OUTER JOIN pro_pdstext ON pro_main.ProjectID = pro_pdstext.ProjectID WHERE pro_main.ProjectID>0 `
    
        // ${join} used to show/hide all emp rows using join controlled by checkbox in frontend

        `SELECT DISTINCT pro_main.ProjectID, pro_main.ProjectNo, pro_pdstext.PdsProjectName,pro_pdstext.PdsProjectLocation,
        pro_pdstext.PdsProjectDescription, pro_pdstext.OwnerContact,pro_pdstext.ClientContact, 
        pro_pdstext.StartEndDates, pro_pdstext.ContractAmount, pro_pdstext.Notes, 
        (select count(*) from pro_main WHERE pro_main.ProjectID>0) as totaldata, 
        (select count(DISTINCT pro_main.ProjectID) ${from} ${sqlWhere}) as totalfiltered 
        FROM pro_main ${join} pro_pdstext ON pro_main.ProjectID = pro_pdstext.ProjectID  
        WHERE pro_main.ProjectID>0 ` 


        if (limit == -1) {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} `;
        } else {
            sql = sql + sqlWhere + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
            console.log("stringsearch : " + sql);
        }


    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            if (rows.length>0) {
                totalData = rows[0].totaldata;
            }
            if (rows.length>0) {
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
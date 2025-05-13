Router.post('/proteam-angular-datatable-test', async function (req, res) { // sending empid in body now
        
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
  
    let empid = req.body.empid;
    let projectid = req.body.projectid;
    let employeeid = req.body.employeeid;
    let dutiesandresponsibilities = req.body.dutiesandresponsibilities;
    let empprojectrole = req.body.empprojectrole;
    let secprojectrole = req.body.secprojectrole;
    let durationfrom = req.body.durationfrom;
    let durationto = req.body.durationto;
    let monthsofexp = req.body.monthsofexp;
    let notes = req.body.notes;




    // to get the column name from index since dtable sends col index
    //** This is needed for order by to work and exact field name should be used
    var columns = {
        0: 'disProjectNo',
        1: 'disEmployeeID',  
        2: 'DutiesAndResponsibilities',
        3: 'EmpProjectRole',
        4:'SecProjectRole', 
        5:'DurationFrom',
        6:'DurationTo',
        7:'MonthsOfExp',
        8:'Notes',
     }

    var totalData = 0;
    // var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index



    var sqlWhere = '';
    filterpresent=false;

    if (empid > 0) {
        // sql = sql + ` AND emp_main.JobTitle = ${jobtitle}`
        sqlWhere = sqlWhere + ` AND emp_main.EmpID = ${empid}`
        filterpresent = true;
    }
    if (projectid > 0) {
        // sql = sql + ` AND emp_main.JobTitle = ${jobtitle}`
        sqlWhere = sqlWhere + ` AND pro_main.ProjectID = ${projectid}`
        filterpresent = true;
    }
    if (DutiesAndResponsibilities != "") {
        sqlWhere = sqlWhere + ` AND pro_team.DutiesAndResponsibilities LIKE '%${dutiesandresponsibilities}%' `;
        filterpresent = true;
    }
    if (empprojectrole != "") {
        sqlWhere = sqlWhere + ` AND list_empprojectrole.Str1 LIKE '%${empprojectrole}%' `;
        filterpresent = true;
    }
    if (durationfrom != "") {
        sqlWhere = sqlWhere + ` AND pro_team.DurationFrom LIKE '%${durationfrom}%' `;
        filterpresent = true;
    }
    if (durationto != "") {
        sqlWhere = sqlWhere + ` AND pro_team.DurationTo LIKE '%${durationto}%' `;
        filterpresent = true;
    }
    if (monthsofexp != "") {
        sqlWhere = sqlWhere + ` AND pro_team.MonthsOfExp LIKE '%${monthsofexp}%' `;
        filterpresent = true;
    }
    if (notes != "") {
        sqlWhere = sqlWhere + ` AND pro_team.Notes LIKE '%${notes}%' `;
        filterpresent = true;
    }




    // For Getting the TotalData without Filter
    // let sql1 = `SELECT * FROM pro_team WHERE pro_team.id>0`;
    //**2023 Chils table queries for total before filter should be like this */
    // let sql1 = `SELECT * FROM pro_team WHERE pro_team.ProjectID=`+ req.body.projectid + ``;//2023
    // mysqlConnection.query(sql1, (err, rows, fields) => {
    //     totalData = rows.length;
    //     totalbeforefilter = rows.length;
    // });


// ** After using pool conn the mysql order has changed. So to keep the order async await is used
// https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
// https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

// await utils.totaldata("SELECT COUNT(ID) AS total FROM pro_team WHERE pro_team.ProjectID="+ req.body.projectid)
await utils.totaldata("SELECT COUNT(ID) AS total FROM pro_team WHERE pro_team.EmpID="+ req.body.empid)
.then(data => {
        totalData = data;
    });
// const value = await totaldata();




    let sql = 

    // `SELECT emp_main.EmployeeID AS disEmployeeID, list_empprojectrole.Str1 AS disEmpProjectRole, list_empprojectrole_1.Str1 AS disSecProjectRole, pro_team.ID, \
    //     pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, pro_team.MonthsOfExp, pro_team.Notes, pro_team.ProjectID, \ 
    //     pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID \
    //     FROM pro_team INNER JOIN \
    //     emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
    //     list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
    //     list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
    //     WHERE (pro_team.EmpID = `+ req.body.empid + `)`


    // 2025 this is for emp-projects
    `SELECT emp_main.EmployeeID AS disEmployeeID, pro_main.ProjectNo AS disProjectNo, list_empprojectrole.Str1 AS disEmpProjectRole, list_empprojectrole_1.Str1 AS disSecProjectRole, pro_team.ID, \
        pro_team.DutiesAndResponsibilities, pro_team.DurationFrom, pro_team.DurationTo, pro_team.MonthsOfExp, pro_team.Notes, pro_team.ProjectID, \ 
        pro_team.EmpProjectRole, pro_team.SecProjectRole, pro_team.EmpID \
        FROM pro_team INNER JOIN \
        emp_main ON pro_team.EmpID = emp_main.EmpID INNER JOIN \
        pro_main ON pro_team.ProjectID = pro_main.ProjectID INNER JOIN \
        list_empprojectrole ON pro_team.EmpProjectRole = list_empprojectrole.ListID INNER JOIN \
        list_empprojectrole AS list_empprojectrole_1 ON pro_team.SecProjectRole = list_empprojectrole_1.ListID \
        WHERE (pro_team.EmpID = `+ req.body.empid + `)`


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
        sql = sql + ` AND list_empprojectrole.Str1 LIKE '%${search}%'`;

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
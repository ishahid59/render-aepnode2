Router.post('/angular-datatable', function (req, res) {
 

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
        0: 'ProjectID',
        1: 'ProjectNo',
        2: 'ProjectName',
        3: 'ProjectRole',
        4: 'AwardYear',
        5: 'ProjectManager',
        6: 'OwnerCategory',
        7: 'ComID',
        8: 'PrimaryProjectType',
        9: 'SecondaryProjectType',
        10: 'Owner',
        11: 'Client',
        12: 'ProjectAgreementNo',
        13: 'ProjectStatus',
        14: 'ProposalID',


        // 0: 'ProjectNo',
        // 1: 'ProjectName',
        // 2: 'AwardYear',
        // 3: 'PrimaryProjectType',
        // 4: 'Owner',

    }

    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index

    // For Getting the TotalData without Filter
    let sql1 = `SELECT * FROM pro_main WHERE pro_main.ProjectID>0`;
    mysqlConnection.query(sql1, (err, rows, fields) => {
        totalData = rows.length;
        // console.log("totalData2 :: " + rows.length);
        // totalbeforefilter = rows.length; // disabled 2023
    });

    let sql =
        //**Note: LINE   "cao_main AS cao_main_1 ON pro_main.Client = cao_main.CAOID LEFT OUTER JOIN "
        // is changed to "cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN "
        `SELECT DISTINCT pro_main.ProjectName, list_proprole.Str1 AS ProjectRole, pro_main.AwardYear, pro_main.ProjectNo, list_proocategory.Str1 AS OwnerCategory, 
        com_main.CompanyName AS ComID, list_projecttype.Str1 AS PrimaryProjectType, pro_main.SecondaryProjectType, cao_main.Name AS Owner, 
        cao_main_1.Name AS Client, pro_main.ProjectAgreementNo, emp_main.EmployeeID AS ProjectManager, list_prostatus.Str1 AS ProjectStatus, 
        proposal_main.ProposalNo AS ProposalID, pro_main.ProjectID
        FROM  pro_main LEFT OUTER JOIN
        list_prostatus ON pro_main.ProjectStatus = list_prostatus.ListID LEFT OUTER JOIN
        list_projecttype ON pro_main.PrimaryProjectType = list_projecttype.ListID LEFT OUTER JOIN
        list_proocategory ON pro_main.OwnerCategory = list_proocategory.ListID LEFT OUTER JOIN
        list_proprole ON pro_main.ProjectRole = list_proprole.ListID LEFT OUTER JOIN
        proposal_main ON pro_main.ProposalID = proposal_main.ProposalID LEFT OUTER JOIN
        cao_main ON pro_main.Owner = cao_main.CAOID LEFT OUTER JOIN
        cao_main AS cao_main_1 ON pro_main.Client = cao_main_1.CAOID LEFT OUTER JOIN
        com_main ON pro_main.ComID = com_main.ComID LEFT OUTER JOIN
        emp_main ON pro_main.ProjectManager = emp_main.EmpID LEFT OUTER JOIN
        pro_team ON pro_main.ProjectID = pro_team.ProjectID LEFT OUTER JOIN
        pro_datesandcosts ON pro_main.ProjectID = pro_datesandcosts.ProjectID
        WHERE (pro_main.ProjectID > 0)`

    if (search == "") {
        // console.log("No Search");
        sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        // sql = sql + ` order by ${col} ${orderdir} `;

        // console.log(sql);
        // console.log("sql print :: " + sql);
        mysqlConnection.query(sql, (err, rows, fields) => {

            if (!err) {
                totalFiltered = totalData;

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

        sql = sql + ` AND pro_main.ProjectNo LIKE '%${search}%'`;
        sql = sql + ` OR pro_main.ProjectName LIKE '%${search}%'`;
        sql = sql + ` OR list_projecttype.Str1 LIKE '%${search}%'`;
        sql = sql + ` OR pro_main.AwardYear LIKE '%${search}%'`;
        sql = sql + ` OR cao_main.Name LIKE '%${search}%'`;

    // //2023 important. When limit and offset is used to sql string then total length always shows the "limit"
    // So total filtered record is calculated before applying limit and
    let totalbeforelimitandoffset = 0;
    let sql3 = sql + ` order by ${col} ${orderdir} `;
    mysqlConnection.query(sql3, (err, rows3, fields) => {
        totalbeforelimitandoffset = rows3.length;
        // console.log("testtotal :: " + sql3);
    });

    sql = sql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
        mysqlConnection.query(sql, (err, rows2, fields) => {
            if (!err) {
                totalFiltered = totalbeforelimitandoffset
                res.json({
                    "draw": draw,
                    "recordsTotal": totalData,
                    "recordsFiltered": totalFiltered,
                    "data": rows2
                });
            }
            else {
                console.log(err);
            }
        });

    } // end else

});
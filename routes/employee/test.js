//EICRA
// Search Datatable severside code
// ***************************************************************************
// Router.post('/search', function (req, res) {
    Router.post('/search', async function (req, res) {


        let draw = req.body.draw;
        let limit = req.body.length;
        let offset = req.body.start;
        let ordercol = req.body['order[0][column]'];
        let orderdir = req.body['order[0][dir]'];
    
        let comid = req.body.comid;
        let primaryprojecttype = req.body.primaryprojecttype;
        let projectrole = req.body.projectrole;
        let ownercategory = req.body.ownercategory;
        let owner = req.body.owner;
        let client = req.body.client;
        let projectstatus = req.body.projectstatus;
        let empid = req.body.empid;
        let empprojectrole = req.body.empprojectrole;
        let firmfeeoperator = req.body.firmfeeoperator;
        let firmfee = req.body.firmfee;
        let constcostoperator = req.body.constcostoperator;
        let constcost = req.body.constcost;
        let expstartdateoperator = req.body.expstartdateoperator;
        let expstartdate = req.body.expstartdate;
        let expenddateoperator = req.body.expenddateoperator;
        let expenddate = req.body.expenddate;
        let excludeieprojects=req.body.excludeieprojects;
        let excludeongoingprojects=req.body.excludeongoingprojects;
    
    // if (req.body.secondaryprojecttype) {
    //     console.log("222:  "+ req.body.secondaryprojecttype[1]);
    // }
    // console.log(typeof req.body.secondaryprojecttype);
    
    
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
            13: 'ProposalID',
        }
    
        var totalData = 0;
        var totalbeforefilter = 0;
        var totalFiltered = 0;
        var col = columns[ordercol];// to get name of order col not index
        //var col = "Pro_Main."+columns[ordercol];// to get name of order col not index also use "Pro_Main." in front to avoid error in order by Project Name in the front end
    
    
    
        // **DISTINCT is used instead of groupby to avoid duplicate row since Pro_Team and Pro_DAC tables are used
        let strsql =
            // `SELECT DISTINCT Pro_Main.ProjectName, List_ProPRole.Str1 AS disProjectRole, Pro_Main.AwardYear, Pro_Main.ProjectNo, List_ProOCategory.Str1 AS disOwnerCategory, 
            // Com_Main.CompanyName AS disComID, List_ProjectType.Str1 AS disPrimaryProjectType, Pro_Main.SecondaryProjectType, CAO_Main.Name AS disOwner, 
            // CAO_Main_1.Name AS disClient, Pro_Main.ProjectAgreementNo, Emp_Main.EmployeeID AS disProjectManager, List_ProStatus.Str1 AS disProjectStatus, 
            // Proposal_Main.ProposalNo AS disProposalID, Pro_Main.ProjectRole, Pro_Main.OwnerCategory, Pro_Main.ComID, Pro_Main.PrimaryProjectType, Pro_Main.Owner, 
            // Pro_Main.Client, Pro_Main.ProjectManager, Pro_Main.ProjectStatus, Pro_Main.ProposalID, Pro_Main.ProjectID
            // FROM  Pro_Main LEFT OUTER JOIN
            // List_ProStatus ON Pro_Main.ProjectStatus = List_ProStatus.ListID LEFT OUTER JOIN
            // List_ProjectType ON Pro_Main.PrimaryProjectType = List_ProjectType.ListID LEFT OUTER JOIN
            // List_ProOCategory ON Pro_Main.OwnerCategory = List_ProOCategory.ListID LEFT OUTER JOIN
            // List_ProPRole ON Pro_Main.ProjectRole = List_ProPRole.ListID LEFT OUTER JOIN
            // Proposal_Main ON Pro_Main.ProposalID = Proposal_Main.ProposalID LEFT OUTER JOIN
            // CAO_Main ON Pro_Main.Owner = CAO_Main.CAOID LEFT OUTER JOIN
            // CAO_Main AS CAO_Main_1 ON Pro_Main.Client = CAO_Main_1.CAOID LEFT OUTER JOIN
            // Com_Main ON Pro_Main.ComID = Com_Main.ComID LEFT OUTER JOIN
            // Emp_Main ON Pro_Main.ProjectManager = Emp_Main.EmpID LEFT OUTER JOIN
            // Pro_Team ON Pro_Main.ProjectID = Pro_Team.ProjectID LEFT OUTER JOIN
            // Pro_DatesAndCosts ON Pro_Main.ProjectID = Pro_DatesAndCosts.ProjectID
            // WHERE (Pro_Main.ProjectID > 0)`
    
            `SELECT DISTINCT Pro_Main.ProjectName, List_ProPRole.Str1 AS ProjectRole, Pro_Main.AwardYear, Pro_Main.ProjectNo, List_ProOCategory.Str1 AS OwnerCategory, 
            Com_Main.CompanyName AS ComID, List_ProjectType.Str1 AS PrimaryProjectType, Pro_Main.SecondaryProjectType, CAO_Main.Name AS Owner, 
            CAO_Main_1.Name AS Client, Pro_Main.ProjectAgreementNo, Emp_Main.EmployeeID AS ProjectManager, List_ProStatus.Str1 AS ProjectStatus, 
            Proposal_Main.ProposalNo AS ProposalID, Pro_Main.ProjectID
            FROM  Pro_Main LEFT OUTER JOIN
            List_ProStatus ON Pro_Main.ProjectStatus = List_ProStatus.ListID LEFT OUTER JOIN
            List_ProjectType ON Pro_Main.PrimaryProjectType = List_ProjectType.ListID LEFT OUTER JOIN
            List_ProOCategory ON Pro_Main.OwnerCategory = List_ProOCategory.ListID LEFT OUTER JOIN
            List_ProPRole ON Pro_Main.ProjectRole = List_ProPRole.ListID LEFT OUTER JOIN
            Proposal_Main ON Pro_Main.ProposalID = Proposal_Main.ProposalID LEFT OUTER JOIN
            CAO_Main ON Pro_Main.Owner = CAO_Main.CAOID LEFT OUTER JOIN
            CAO_Main AS CAO_Main_1 ON Pro_Main.Client = CAO_Main_1.CAOID LEFT OUTER JOIN
            Com_Main ON Pro_Main.ComID = Com_Main.ComID LEFT OUTER JOIN
            Emp_Main ON Pro_Main.ProjectManager = Emp_Main.EmpID LEFT OUTER JOIN
            Pro_Team ON Pro_Main.ProjectID = Pro_Team.ProjectID LEFT OUTER JOIN
            Pro_DatesAndCosts ON Pro_Main.ProjectID = Pro_DatesAndCosts.ProjectID
            WHERE (Pro_Main.ProjectID > 0)`
    
    
    
        let filterpresent = false;
    
    
        if (comid > 0) {
            strsql = strsql + ` AND Com_Main.ComID = ${comid}`
            filterpresent = true;
        }
        if (primaryprojecttype > 0) {
            strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${primaryprojecttype}`
            filterpresent = true;
        }
    // console.log(secondaryprojecttype);
    
        // if (count($request->secondaryprojecttype) > 0){
        //     $total= count($request->secondaryprojecttype); 
        //     $i=0;
        //     for ($i=0; $i < $total ; $i++) { 
        //       if ($i==0) {
        //         $query=$query->where('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
        //       }
        //       else{
        //         $query=$query->orWhere('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
        //         // May have to use where instead of orwhere
        //         // $query=$query->Where('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
        //       }
        //     }
        //   }
    
        if (projectrole > 0) {
            strsql = strsql + ` AND Pro_Main.ProjectRole = ${projectrole}`
            filterpresent = true;
        }
        if (ownercategory > 0) {
            strsql = strsql + ` AND Pro_Main.OwnerCategory = ${ownercategory}`
            filterpresent = true;
        }
        if (owner > 0) {
            strsql = strsql + ` AND Pro_Main.Owner = ${owner}`
            filterpresent = true;
        }
        if (client > 0) {
            strsql = strsql + ` AND Pro_Main.Client = ${client}`
            filterpresent = true;
        }
        if (projectstatus > 0) {
            strsql = strsql + ` AND Pro_Main.ProjectStatus = ${projectstatus}`
            filterpresent = true;
        }
        // Multitable table
        if (empid > 0) {
            strsql = strsql + ` AND Pro_Team.EmpID = ${empid}`
            filterpresent = true;
        }
        if (empprojectrole > 0) {
            strsql = strsql + ` AND Pro_Team.EmpProjectRole = ${empprojectrole}`
            filterpresent = true;
        }  
      
    
        // Chk boxes
        if (excludeieprojects > 0) {
            projectrole=excludeieprojects
            strsql = strsql + ` AND Pro_Main.ProjectRole != 4`
            filterpresent = true;
        }   
        if (excludeongoingprojects > 0) {
            projectrole=excludeongoingprojects
            strsql = strsql + ` AND Pro_DatesAndCosts.ActualCompletionDate != null`
            strsql = strsql + ` AND Pro_DatesAndCosts.ActualCompletionDate <> 0`
            filterpresent = true;
        }  
    
    
        // Fee and cost
        if (firmfeeoperator != "") {
            let operator=firmfeeoperator
            let amount=firmfee * 1000
            strsql = strsql + ` AND Pro_DatesAndCosts.FirmFee${operator}${amount}`
            filterpresent = true;
        }  
        if (constcostoperator != "") {
            let operator=constcost
            let amount=con * 1000
            strsql = strsql + ` AND Pro_DatesAndCosts.ConstructionCost${operator}${amount}`
            filterpresent = true;
        }  
    
        // duration dates from pro_team
        if (expstartdateoperator != "") {
            let operator=expstartdateoperator
            let date=expstartdate
            strsql = strsql + ` AND Pro_Team.DurationFrom${operator}${date}`
            filterpresent = true;
        }     
        if (expenddateoperator != "") {
            let operator=expenddateoperator
            let date=expenddate
            strsql = strsql + ` AND Pro_Team.DurationFrom${operator}${date}`
            filterpresent = true;
        }     
    
    
    
        try {
    
            let pool = await sql.connect(mssqlconfig)
            //let pool = await poolPromise
            let result2 = await pool.request()
                .query(`SELECT(SELECT COUNT(*)FROM Pro_Main) AS Total`)
                // .query(`SELECT ProjectID FROM Pro_Main`)
                // let count = result2.rowsAffected - 2;
            let count = result2.recordset[0].Total - 2;
            totalData = count;
            totalbeforefilter = count;
    
    
            // if no filter than totalFiltered count wiil be all like totalbeforefilter
            if (!filterpresent) {
                totalFiltered = totalbeforefilter;
            }
            // else count totalfiltered before applying "offset" and "limit" to the query
            else {
                strsql2=strsql+ ` order by Pro_Main.${col} ${orderdir}` //**NOTE: word "Pro_Main." must be used before ${col} */
                let result = await pool.request().query(strsql2)
                // totalFiltered = result.recordsets[0].length;
                totalFiltered = result.rowsAffected;
            }     
            // now run finalstrsql applying "offset" and "limit" to the query string
             //**NOTE: word "Pro_Main." must be used before ${col} */
            //finalstrsql = strsql + ` order by Pro_Main.${col} ${orderdir}`//OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
            finalstrsql = strsql + ` order by Pro_Main.${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    
            let resultwithoffset = await pool.request().query(finalstrsql)
    
            res.json({
                "draw": draw,
                "recordsTotal": totalData,
                "recordsFiltered": totalFiltered,
                "data": resultwithoffset.recordset
            });
    
        }
    
        catch (err) {
            // console.log("error")
            return res.status(500).send("MSSQL ERROR: " + err);
        }
    
    });
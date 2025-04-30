const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
// authenticateToken can be used locally(on each function) or globally in server for all mod
// const authenticateToken= require('../middleware/authenticateToken');



// Router.get('/all',authenticateToken,  function (req, res) {// with local auth
Router.get('/cmbproprimaryprojecttype',  (req, res) => {
    // let sql = "SELECT list_empdegree.ListID, list_empdegree.str1,list_empdegree.str2 FROM list_empdegree WHERE list_empdegree.ListID>-1 ORDER BY list_empdegree.ListID";
    // let sql = "SELECT * FROM list_empdegree WHERE list_empdegree.listid>-1 ORDER BY list_empdegree.listid";
    let sql = "SELECT * FROM list_projecttype WHERE list_projecttype.ListID>-1 ORDER BY list_projecttype.ListID";
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
            // console.log(res.json(rows));
        } else {
            console.log(err);
        }
    });
})

// same as cmbproprimaryprojecttype
Router.get('/cmbprojecttype',  (req, res) => {
     let sql = "SELECT * FROM list_projecttype WHERE list_projecttype.ListID>-1 ORDER BY list_projecttype.ListID";
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
})


// for projecttype for ngselect multi
Router.get('/cmbprojecttypemulti',  (req, res) => {
    let sql = "SELECT * FROM list_projecttype WHERE list_projecttype.ListID>0 ORDER BY list_projecttype.ListID";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})



// MULTISELECT in ajax call (Order of columns needed to be changd for multiselect dataprovifer)
// For sec project type avoid 0 row for Multi select dropdown
// Router.get('/all',authenticateToken,  function (req, res) {// with local auth

Router.get('/cmbprosecprojecttypemultiselect',  (req, res) => {
    // let sql = "SELECT list_empdegree.ListID, list_empdegree.str1,list_empdegree.str2 FROM list_empdegree WHERE list_empdegree.ListID>-1 ORDER BY list_empdegree.ListID";
    // let sql = "SELECT * FROM list_empdegree WHERE list_empdegree.listid>-1 ORDER BY list_empdegree.listid";
    let sql = "SELECT list_projecttype.Str1 as label,list_projecttype.Str2 as title,list_projecttype.ListID as value FROM list_projecttype WHERE list_projecttype.ListID>0 ORDER BY list_projecttype.ListID";
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
            // console.log(res.json(rows));
        } else {
            console.log(err);
        }
    });
})

//For getting sec project type val for Multi select dropdown to select items
Router.get('/secprojecttypevalue/:projectid', function (req, res) {
         mysqlConnection.query("SELECT SecondaryProjectType FROM pro_main WHERE pro_main.ProjectID=?", req.param('projectid'), (err, rows, fields) => {
        if (!err) {
            res.send(rows[0]);
        } else {
            console.log(err);
        }
    });
});








Router.get('/cmbproprole',  (req, res) => {
    let sql = "SELECT * FROM list_proprole WHERE list_proprole.ListID>-1 ORDER BY list_proprole.ListID";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})

Router.get('/cmbempmain',  (req, res) => {
    let sql = "SELECT EmpID, EmployeeID FROM emp_main WHERE emp_main.EmpID>-1 ORDER BY emp_main.EmployeeID";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})

Router.get('/cmbproocategory',  (req, res) => {
    let sql = "SELECT * FROM list_proocategory WHERE list_proocategory.ListID>-1 ORDER BY list_proocategory.ListID";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})
Router.get('/cmbcommain',  (req, res) => {
    let sql = "SELECT ComID,CompanyName FROM com_main WHERE com_main.ComID>-1 ORDER BY com_main.CompanyName";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})

Router.get('/cmbcaomain',  (req, res) => {
    let sql = "SELECT CAOID,Name,FullName FROM cao_main WHERE cao_main.CAOID>-1 ORDER BY cao_main.Name";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})

Router.get('/cmbprostatus',  (req, res) => {
    let sql = "SELECT * FROM list_prostatus WHERE list_prostatus.ListID>-1 ORDER BY list_prostatus.ListID";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})


Router.get('/cmbempprojectrole',  (req, res) => {
    let sql = "SELECT * FROM list_empprojectrole WHERE list_empprojectrole.ListID>-1 ORDER BY list_empprojectrole.ListID";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})


             
Router.get('/cmbproprofilecodesf330',  (req, res) => {
    let sql = "SELECT * FROM list_profilecodesf330 WHERE list_profilecodesf330.ListID>-1 ORDER BY list_profilecodesf330.ListID";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})

Router.get('/cmbproprofilecodesf254',  (req, res) => {
    let sql = "SELECT * FROM list_profilecodesf254 WHERE list_profilecodesf254.ListID>-1 ORDER BY list_profilecodesf254.ListID";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})


Router.get('/cmbprodesitem',  (req, res) => {
    // let sql = "SELECT * FROM list_prodesitem WHERE list_prodesitem.ListID>-1 ORDER BY list_prodesitem.ListID";
    // 2025 after ngselect
    let sql = "SELECT * FROM list_prodesitem WHERE list_prodesitem.ListID>0 ORDER BY list_prodesitem.ListID";

   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})


Router.get('/cmbproposalmain',  (req, res) => {
    let sql = "SELECT ProposalID,ProposalNo,ProjectName FROM proposal_main WHERE proposal_main.ProposalID>-1 ORDER BY proposal_main.ProjectName";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})


Router.get('/cmbproposalstatus',  (req, res) => {
    let sql = "SELECT list_proposalstatus.ListID, list_proposalstatus.Str1 FROM list_proposalstatus WHERE list_proposalstatus.ListID>-1 ORDER BY list_proposalstatus.ListID";
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
})


Router.get('/cmbprojectawardstatus',  (req, res) => {
    let sql = "SELECT list_projectawardstatus.ListID, list_projectawardstatus.Str1 FROM list_projectawardstatus WHERE list_projectawardstatus.ListID>-1 ORDER BY list_projectawardstatus.ListID";
    mysqlConnection.query(sql, (err, rows, fields) => {
        if (!err) {
            res.json(rows);
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


Router.get('/cmbprophoto',  (req, res) => {
    let sql = "SELECT * FROM list_prophoto WHERE list_prophoto.ListID>-1 ORDER BY list_prophoto.ListID";
   mysqlConnection.query(sql, (err, rows, fields) => {
       if (!err) {
           res.json(rows);
       } else {
           console.log(err);
       }
   });
})

    
module.exports = Router;


    
    
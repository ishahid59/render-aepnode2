const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../connection');



// async function maxid(table,field) {
//     try {
//         let pool = await sql.connect(mssqlconfig)
//         let result = await pool.request() 
//         .query(`SELECT MAX(${field}) as id FROM ${table}`)
//         return result.recordset[0]
//     } catch (err) {
//         // return res.status(400).send("MSSQL ERROR: " + err);
//         return err
//     }
// }



// Router.get('/maxempdegreeid', function (req, res) {
function maxid(table, field) {
    mysqlConnection.query("SELECT MAX(" + field + ") as maxid FROM  " + table + "", (err, result) => {
        if (err) {
            console.log(err)
        }
        // res.send(result);
        return(result[0].maxid);
    })
}







// MSSQL CODES
// ****************************************************************

// async function maxid(table,field) {
//     try {
//         let pool = await sql.connect(mssqlconfig)
//         let result = await pool.request() 
//         .query(`SELECT MAX(${field}) as id FROM ${table}`)
//         return result.recordset[0]
//     } catch (err) {
//         // return res.status(400).send("MSSQL ERROR: " + err);
//         return err
//     }
// }




// // Set NULL for Mssql db for empty dates
// async function setNullDate(reqDate) {
//     try {
//         if (reqDate == '') {
//             return 'NULL'
//         } else {
//             return `'${reqDate}'` // '' is used for date to avoid err
//         }
//     } catch (err) {
//         // return res.status(400).send("MSSQL ERROR: " + err);
//         return err
//     }
// }


// // Check if item exists in a recordset
// async function alreadyHaveItem(ID, table, parentidname, parentidval, idname, idval) {

//     try {

//         let pool = await sql.connect(mssqlconfig)

//         // First check if the selected item has not been changed by user using request ID
//         // But only check this if the form is not in addmode to avoid sql error 
//         if (ID > 0) { //check if not in addmode 
//             let preresult = await pool.request()
//                 .query(`SELECT ${idname} FROM ${table} WHERE ID=${ID} `)
//             let preidval = preresult.recordset[0][idname]
//             if (preidval === idval) {
//                 return
//             }
//         }


//         // Then check if selected item has changed, check if the item exists
//         let result = await pool.request()
//             .query(`SELECT ${idname} FROM ${table} WHERE  ${idname}=${idval} AND ${parentidname}=${parentidval} `)
//         if (result.recordset.length > 0) {
//             return true
//         } else {
//             return false
//         }

//     } catch (err) {
//         // return res.status(400).send("MSSQL ERROR: " + err);
//         return err
//     }
// }

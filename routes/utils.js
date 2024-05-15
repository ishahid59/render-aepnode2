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



// // Router.get('/maxempdegreeid', function (req, res) {
// async function maxid(table, field) {
//     mysqlConnection.query("SELECT MAX(" + field + ") as maxid FROM  " + table + "", (err, result) => {
//         if (err) {
//             console.log(err)
//         }
//         // res.send(result);
//         return(result[0].maxid);
//     })
// }



async function maxid(table, field) {
    return new Promise((resolve, reject) => {
        let maxid;
        // mysqlConnection.query(sql1, (err, rows, fields) => {
        // mysqlConnection.query("SELECT MAX(" + field + ") as maxid FROM  " + table + "", (err, result) => {
        mysqlConnection.query("SELECT MAX(" + field + ") as maxid FROM  " + table + "", (err, rows, fields) => {
            if (!err) {
                // maxid=result[0].maxid; //for sql count
                maxid = (rows[0].maxid);
            } else {
                console.log(err);
            }

        // when query result from a function is called  it doesnt return a value.  So promise is used
        // we needed async function for execution sequence, and async function returns promise not any plain value. so Promise is used
        const data = maxid;
            resolve(data);
        });
    });
}



// used emp and project main and search
// https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
// ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
// https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
// https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

// async function totaldata(sql1) {
//     return new Promise((resolve, reject) => {
//         let totaldata;
//         mysqlConnection.query(sql1, (err, rows, fields) => {
//             if (!err) {
//                 totaldata=rows.length.toString();
//             } else {
//                 console.log(err);
//             }
//         const data = totaldata;//'Some data';
//         resolve(data);            
//         });
//     });
//   }



async function totaldata(sql1) {
    return new Promise((resolve, reject) => {
        let totaldata = 0;
        // mysqlConnection.query(sql1, (err, rows, fields) => {
        mysqlConnection.query(sql1, (err, rows, fields) => {
            if (!err) {
                // totaldata=rows.length.toString();
                if (rows.length > 0) {
                    totaldata = rows[0].total; //for sql count
                }
            } else {
                console.log(err);
            }
            const data = totaldata;////when an async function is called, it returns a new Promise  instead of plain data. so promise is send
            resolve(data);
        });
    });
}


async function duplicateitemcheck(sql1) {
    return new Promise((resolve, reject) => {

        let duplicateitemfound = false;
        mysqlConnection.query(sql1, (err, rows, fields) => {
            if (!err) {
                if (rows.length > 0) {
                    // totaldata = rows[0].total; //for sql count
                    duplicateitemfound = true;
                }
            } else {
                console.log(err);
            }
            const data = duplicateitemfound;////when an async function is called, it returns a new Promise  instead of plain data. so promise is send
            resolve(data);
        });
    });
}



// used emp and project main and search
// https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.
// ** 2024 After using pool conn the mysql order has changed. So to keep the order async await is used
// https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
// https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

async function totalbeforelimtandoff(sql1) {
    return new Promise((resolve, reject) => {
        let totaldata = 0;
        mysqlConnection.query(sql1, (err, rows, fields) => {
            if (!err) {
                if (rows.length > 0) {
                    totaldata = rows.length.toString();
                }
            } else {
                console.log(err);
            }
            const data = totaldata;//'Some data';
            resolve(data);
        });
    });
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



// module.exports = maxid; 
// Must export in this format instead of above format for importing all from this module
module.exports = {
    maxid,  totaldata, totalbeforelimtandoff, duplicateitemcheck //, setNullDate, alreadyHaveItem,
   
}
const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');

// combo moved to ampcombo need to delete this file
// Router.get('/cmbempjobtitle',  (req, res) => {
//     let sql = "SELECT list_empjobtitle.listid, list_empjobtitle.str1,list_empjobtitle.str2 FROM list_empjobtitle WHERE list_empjobtitle.listid>-1 ORDER BY list_empjobtitle.listid";
//     mysqlConnection.query(sql, (err, rows, fields) => {
//         if (!err) {
//             res.json(rows);
//         } else {
//             console.log(err);
//         }
//     });
// })

module.exports = Router;
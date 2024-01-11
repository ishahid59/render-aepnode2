const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
// authenticateToken can be used locally(on each function) or globally in server for all mod
// const authenticateToken= require('../middleware/authenticateToken');


// Router.get('/all',authenticateToken,  function (req, res) {// with local auth








Router.post('/prophoto-angular-datatable', function (req, res) { // sending empid in body now
        
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
    var columns = {
        0: 'PhotoName',
        1: 'Description',
        2: 'CreateDate',
        3: 'LastModifyDate',
        4: 'Action',
     }

     
     



    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index

    // For Getting the TotalData without Filter
    // let sql1 = `SELECT * FROM pro_descriptions WHERE pro_descriptions.id>0`;
    // let sql1 = `SELECT * FROM pro_descriptions WHERE pro_descriptions.ProjectID=`+ req.body.projectid + ``;//2023
    let sql1 = `SELECT * FROM pro_photo WHERE pro_photo.ProjectID=`+ req.body.projectid + ``;//2023

    mysqlConnection.query(sql1, (err, rows, fields) => {
        totalData = rows.length;
        totalbeforefilter = rows.length;
    });

    let sql = 



        // `SELECT  pro_descriptions.ID, list_prodesitem.Str1 AS disItemName, pro_descriptions.Notes, pro_descriptions.Description, pro_descriptions.DescriptionPlainText, 
        // pro_descriptions.ItemName, pro_descriptions.ProjectID
        // FROM  pro_descriptions INNER JOIN
        // list_prodesitem ON pro_descriptions.ItemName = list_prodesitem.ListID
        // WHERE (pro_descriptions.ProjectID = `+ req.body.projectid + `)`
        `SELECT * FROM pro_photo 
        WHERE (pro_photo.ProjectID = `+ req.body.projectid + `)`


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
        sql = sql + ` AND pro_photo.PhotoName LIKE '%${search}%'`;
        sql = sql + ` OR pro_photo.Description LIKE '%${search}%'`;

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
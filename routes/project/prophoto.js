const express = require('express');

const Router = express.Router();
const { check, validationResult } = require('express-validator');
const mysqlConnection = require('../../connection');
// authenticateToken can be used locally(on each function) or globally in server for all mod
// const authenticateToken= require('../middleware/authenticateToken');
const multer = require('multer');
const path = require('path');// for image path
const fs = require("fs");
const moment = require('moment');
const utils = require('../utils');

// Router.get('/all',authenticateToken,  function (req, res) {// with local auth



Router.get('/maxprophotoid', function (req, res) {
    // console.log("from maxempid"); 
    mysqlConnection.query("SELECT MAX(ID) as maxprophotoid FROM  pro_photo", (err, result) => {
        if (err) {
            console.log(err)
        }
        res.send(result);
        // res.send(result[0].empid);
    });

});




Router.post('/prophoto-angular-datatable', async  function (req, res) { // sending empid in body now
        
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
    
    // let sql1 = "SELECT * FROM pro_photo WHERE pro_photo.ProjectID="+ req.body.projectid;//2023

    // mysqlConnection.query(sql1, (err, rows, fields) => {
    //     totalData = rows.length;
    //     // totalData =  rows[0].total;
    //     totalbeforefilter = rows.length;
    //     // totalbeforefilter =   rows[0].total;
    // });



    // ** After using pool conn the mysql order has changed. So to keep the order async await is used
    // https://www.google.com/search?q=async+function+%5Bobject+Promise%5D&oq=async+function+%5Bobject+Promise%5D&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB7SAQgxMjIyajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
    // https://medium.com/@lelianto.eko/callback-vs-promise-vs-async-await-in-javascri-f29a63d57f72#:~:text=A%20promise%20is%20an%20object,in%20a%20more%20elegant%20way.

    await utils.totaldata("SELECT COUNT(ID) AS total FROM pro_photo WHERE pro_photo.ProjectID="+ req.body.projectid)
        .then(data => {
            totalData = data;
        });
    // const value = await totaldata();





    let sql = 

        `SELECT pro_photo.ID, pro_photo.PhotoName, pro_photo.CreateDate, emp_main.EmployeeID AS disCreatedBy, pro_photo.LastModifyDate, emp_main_1.EmployeeID AS disLastModifiedBy, pro_photo.CreatedBy, pro_photo.LastModifiedBy, 
        pro_photo.ImageData, pro_photo.Description, pro_photo.ProjectID,  pro_main.ProjectNo 
    FROM pro_photo LEFT OUTER JOIN
         pro_main ON pro_photo.ProjectID =  pro_main.ProjectID LEFT OUTER JOIN
        emp_main AS emp_main_1 ON pro_photo.LastModifiedBy = emp_main_1.EmpID LEFT OUTER JOIN
        emp_main ON pro_photo.CreatedBy = emp_main.EmpID
    WHERE (pro_photo.ProjectID = ${req.body.projectid})`

    // `SELECT Pro_Photo.ID, Pro_Photo.CreateDate, Emp_Main.EmployeeID AS disCreatedBy, Pro_Photo.LastModifyDate, emp_main_1.EmployeeID AS disLastModifiedBy, Pro_Photo.CreatedBy, Pro_Photo.LastModifiedBy, Pro_Photo.ImageData, Pro_Photo.Description, Pro_Photo.ProjectID, Pro_Main.ProjectNo,  List_ProPhoto.Str1 AS PhotoName
    // FROM Pro_Photo INNER JOIN  
    // List_ProPhoto ON Pro_Photo.PhotoName =  List_ProPhoto.ListID LEFT OUTER JOIN 
    // Pro_Main ON Pro_Photo.ProjectID = Pro_Main.ProjectID LEFT OUTER JOIN 
    // Emp_Main AS emp_main_1 ON Pro_Photo.LastModifiedBy = emp_main_1.EmpID LEFT OUTER JOIN 
    // Emp_Main ON Pro_Photo.CreatedBy = Emp_Main.EmpID 
    // WHERE (Pro_Photo.ProjectID = ${req.body.projectid})`

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




// EDIT get mssql
// Router.get('/edit/:id', async function (req, res) {

//     try {
//         let pool = await sql.connect(mssqlconfig)
//         let result = await pool.request()
//             .query(`SELECT * FROM Pro_Photo WHERE ID=${req.param("id")}`)
//         res.send(result.recordset[0])
//     } catch (err) {
//         return res.status(500).send("MSSQL ERROR: " + err);
//     }
// });



Router.get('/getimagedata/:id', (req, res) => {

    // let sql2 = `SELECT pro_photo.PhotoName, pro_photo.ImageData
    //     FROM pro_photo 
    //     WHERE pro_photo.ProjectID=? AND pro_photo.PhotoName LIKE '%pds%' ORDER BY pro_photo.PhotoName `


    let sql = `SELECT pro_photo.ID, pro_photo.ProjectID, pro_photo.PhotoName, pro_photo.ImageData, pro_main.ProjectNo 
        FROM pro_photo LEFT OUTER JOIN
        pro_main ON pro_photo.ProjectID =  pro_main.ProjectID 
        WHERE pro_photo.PhotoName LIKE '%pds%' and pro_photo.ProjectID=? `


    mysqlConnection.query(sql, req.param('id'), (err, rows, fields) => {
        if (!err) {
            res.send(rows); //NOTE Have to send the [0] row
            console.log(rows);
            // res.render("Hello.ejs", {name:rows});     
            0
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
    
        // let sql = "SELECT * FROM pro_photo WHERE pro_photo.ID=?";

        let sql = `SELECT pro_photo.ID, pro_photo.PhotoName, pro_photo.CreateDate, emp_main.EmployeeID AS disCreatedBy, pro_photo.LastModifyDate, emp_main_1.EmployeeID AS disLastModifiedBy, pro_photo.CreatedBy, pro_photo.LastModifiedBy, 
        pro_photo.ImageData, pro_photo.Description, pro_photo.ProjectID,  pro_main.ProjectNo
    FROM     pro_photo LEFT OUTER JOIN
         pro_main ON pro_photo.ProjectID =  pro_main.ProjectID LEFT OUTER JOIN
        emp_main AS emp_main_1 ON pro_photo.LastModifiedBy = emp_main_1.EmpID LEFT OUTER JOIN
        emp_main ON pro_photo.CreatedBy = emp_main.EmpID
    WHERE  pro_photo.ID=?`
    
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











// // DELETE
// Router.delete('/:id', async function (req, res) {

//     try {
//         let pool = await sql.connect(mssqlconfig)
//         let result = await pool.request()
//             .query(`DELETE FROM Pro_Photo WHERE ID=${req.param("id")}`)
//         res.send(result.rowsAffected)
//     } catch (err) {
//         return res.status(500).send("MSSQL ERROR: " + err);
//     }
// });







// //IMAGE UPLOAD CODES ************************************************************

// https://www.youtube.com/watch?v=srPXMt1Q0nY 
// Set The Storage Engine for file upload
const storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
        // cb(null, './public/img/prophoto/')
        // create-folder-if-not-exist : https://stackoverflow.com/questions/59646445/multer-create-folder-if-not-exist
        // balayAudPath = `./public/img/prophoto/${req.body.ProjectNo}`
        // console.log("test : " + req.body.ProjectNo);
        var projectno = req.body.ProjectNo;
        balayAudPath = './public/img/prophoto/' + projectno + "";
        // balayAudPath = 'https://www.compulinkbd.com/TestReport/' + projectno + "";
       fs.mkdirSync(balayAudPath, { recursive: true })
        cb(null, balayAudPath)

    },
    filename: function (req, file, cb) {
        // cb(null, req.body.ProjectID + '-' + Date.now() + path.extname(file.originalname));
        // cb(null, "1990-0238/"+req.body.PhotoName + '-' + Date.now() + path.extname(file.originalname));
        cb(null, req.body.PhotoName  + '-' + Date.now() + path.extname(file.originalname));
        // cb(null, req.body.PhotoName + path.extname(file.originalname));
    }
});
 
// const upload=multer({dest:"./public/img/empphoto/"})
// const upload = multer({ storage: storage })
const upload = multer(
    {
        storage: storage,
        limits: { fileSize: 1000000 /*1000000 bytes */ },
        fileFilter: function (req, file, cb) { // https://www.youtube.com/watch?v=w1kYZ0SOQTY&t=1350s
            // var ext = path.extname(file.originalname);
            // if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            // if(ext !== '.png' || ext !== '.jpg' || ext !== '.gif' || ext !== '.jpeg') {

            // if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif' || file.mimetype === 'image/jpeg') {
            if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif' || file.mimetype === 'image/jpeg') {
                // return callback(new Error('Only images are allowed')) //not working
                cb(null, true);
            }
            else {
                // return callback(new Error('Only images are allowed')) //not working
                cb(new Error('Only images are allowed')) //not working
                // cb(null, false);
            }
        },
    })
 
// //END IMAGE UPLOAD CODES ************************************************************





// // to catch all general errors and multer err in prophoto module, can also be used in server for all module
// // https://expressjs.com/en/guide/error-handling.html
// // https://www.youtube.com/watch?v=w1kYZ0SOQTY&t=1350s
// Router.use((err, req, res, next) => {
//     // console.error(err.stack)
//     // res.status(500).send('Something broke!')
//     if (err) {

//         if (err instanceof multer.MulterError) {
//             // A Multer error occurred when uploading.
//             res.status(500).send("Multer Error : " + err.error)
//         } else {
//             res.status(500).send(err.message)
//             console.log(err.message)
//             // res.send("An unknown error occurred when uploading.");
//         }
//     }
//     else {
//         res.send("success")
//     }
// })


// // using in server.js
// // to catch all general errors and multer err
// // https://expressjs.com/en/guide/error-handling.html
// Router.use((err, req, res, next) => {
//     // console.error(err.stack)
//     // res.status(500).send('Something broke!')
//     if (err instanceof multer.MulterError) {
//         // A Multer error occurred when uploading.
//         res.status(500).send("Multer Error : " + err.message)
//     } else if (err) {
//         // res.send("An unknown error occurred when uploading.");
//         res.send(err.message);
//     }
// })



// INSERT
Router.post('/', upload.single("Image"), [
    // check('degree', "Degree cannot be empty.").notEmpty(),
    // check('itemname', "Item name cannot be empty.").isInt({ min:1}),
    // check('photoname', "PhotoName cannot be empty.").notEmpty()
    // check('degree', "Degree cannot be empty.").isInt({ min:1, max: 2000}),
    // check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
],
    async function (req, res) {

        console.log(req.body);
        // console.log(req.file);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
       

        if (req.file != undefined) {
            req.body.ImageData = req.body.ProjectNo + "/" + req.file.filename;
        }



        var maxid = 0;
        // when query result from a function is called  it doesnt return a value.  So promise is used
        // we needed async function for execution sequence, and async function returns promise not any plain value. so Promise is used
        // await utils.maxid("SELECT COUNT(ID) AS total FROM emp_registration WHERE emp_registration.EmpID="+ req.body.empid)
        await utils.maxid("pro_photo","ID")
        .then(data => {
            maxid = data;
        });
        req.body.ID = maxid + 1;


       
        var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        const prophoto = {
             ID : req.body.ID,
             ProjectID : req.body.ProjectID,
             PhotoName : req.body.PhotoName, //2023
             Description : req.body.Description, //2023
              ImageData : req.body.ImageData,//req.body.ProjectNo + "/" + req.body.PhotoName; //2023
           // ImageData : req.body.ProjectNo + "/" + req.body.PhotoName, //2023

             CreateDate : mysqlTimestamp,
            //  LastModifyDate : moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'); // can use mysqlTimestamp;//
             CreatedBy : req.body.CreatedBy,
             LastModifiedBy : req.body.LastModifiedBy
        }

        mysqlConnection.query('INSERT INTO pro_photo SET ?', prophoto, function (error, results, fields) {
            if (!error) {
                // console.log(query.sql); 
                console.log("success");
                res.send(prophoto);
            } else {
                console.log(error);
            }
        });





        // let query = `UPDATE pro_photo SET ProjectID = ?, PhotoName = ?, Description = ?, ImageData = ?, CreateDate = ?, LastModifyDate = ?, CreatedBy = ?, LastModifiedBy = ? WHERE ID=?`;
        // // mysqlConnection.query(query, [name, email, password, remember_token, created_at, updated_at, id], (err, rows, fields) => {
        // // mysqlConnection.query(query, [name, email, hashedPassword, remember_token, created_at, updated_at, id], (err, rows, fields) => {
        // mysqlConnection.query(query, [ProjectID, PhotoName, Description, ImageData, CreateDate, LastModifyDate, CreatedBy, LastModifiedBy, ID], (err, rows, fields) => {

        //     if (!err) {
        //         res.send(rows);
        //     } else {
        //         console.log(err);
        //     }
        // });



    });






 

// UPDATE
Router.post('/update', upload.single("Image"), [
    // check('degree', "Degree cannot be empty.").notEmpty(),
    // check('itemname', "Item name cannot be empty.").isInt({ min:1}),
    check('PhotoName', "PhotoName cannot be empty.").notEmpty()
    // check('degree', "Degree cannot be empty.").isInt({ min:1, max: 2000}),
    // check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
],
 
 
     function (req, res) {

        // Delete the previous image to preserve space
        // fs.unlinkSync("./public/img/prophoto/" + req.body.ImageData);//delete uploaded photo

        console.log(req.body);
        // console.log(req.file);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
 
        if (req.file != undefined) {
            // 2024 Delete the previous image to preserve space
            fs.unlinkSync("./public/img/prophoto/" + req.body.ImageData);//delete uploaded photo
            req.body.ImageData = req.body.ProjectNo + "/" + req.file.filename;
        }

        let ID = req.body.ID;
        let ProjectID = req.body.ProjectID;
        let PhotoName = req.body.PhotoName; //2023
        let Description = req.body.Description; //2023
        let ImageData = req.body.ImageData;//req.body.ProjectNo + "/" + req.body.PhotoName; //2023
        // let CreateDate = req.body.CreateDate;
        let CreateDate = moment(req.body.CreateDate).format('YYYY-MM-DD HH:mm:ss');
        let LastModifyDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'); // can use mysqlTimestamp;//
        let CreatedBy = req.body.CreatedBy;
        let LastModifiedBy = req.body.LastModifiedBy;


        // let query = `UPDATE pro_photo SET ProjectID = ?, PhotoName = ?, Description = ?, ImageData = ?, CreateDate = ?, LastModifyDate = ?, CreatedBy = ?, LastModifiedBy = ? WHERE ID=?`;
        // // mysqlConnection.query(query, [name, email, password, remember_token, created_at, updated_at, id], (err, rows, fields) => {
        // // mysqlConnection.query(query, [name, email, hashedPassword, remember_token, created_at, updated_at, id], (err, rows, fields) => {
        // mysqlConnection.query(query, [ProjectID, PhotoName, Description, ImageData, CreateDate, LastModifyDate, CreatedBy, LastModifiedBy, ID], (err, rows, fields) => {

        // CreateDate is removed to keep as is fot edit
        let query = `UPDATE pro_photo SET ProjectID = ?, PhotoName = ?, Description = ?, ImageData = ?, LastModifyDate = ?, CreatedBy = ?, LastModifiedBy = ? WHERE ID=?`;
        // mysqlConnection.query(query, [name, email, password, remember_token, created_at, updated_at, id], (err, rows, fields) => {
        // mysqlConnection.query(query, [name, email, hashedPassword, remember_token, created_at, updated_at, id], (err, rows, fields) => {
        mysqlConnection.query(query, [ProjectID, PhotoName, Description, ImageData, LastModifyDate, CreatedBy, LastModifiedBy, ID], (err, rows, fields) => {


            if (!err) {
                res.send(rows);
            } else {
                console.log(err);
            }
        });
    });





    // DELETE pro photo
    Router.delete('/:prophotoid', function (req, res) {

        let imagedata='';

        mysqlConnection.query("select ImageData from pro_photo WHERE ID=?", req.param('prophotoid'), (err, rows, fields) => {
            imagedata = rows[0].ImageData;

            // to also delete uploaded photo
            // TODO when promain is deleted projectID constrain will delete table data but in this case phot will not be deleted from folder
            fs.unlinkSync("./public/img/prophoto/" + imagedata);//delete uploaded photo

        });
   
        // fs.unlinkSync("./public/img/prophoto/" + req.param('imagedata'));//delete uploaded photo
        mysqlConnection.query("DELETE FROM pro_photo WHERE ID=?", req.param('prophotoid'), (err, rows, fields) => {
            if (!err) {
                res.send(rows);
            } else {
                console.log(err);
            }
        });
        // mysqlConnection.query("select ImageData from pro_photo WHERE ID=?", req.param('prophotoid'), (err, rows, fields) => {
        //     if (!err) {
        //         // res.send(rows);
        //         // console.log(rows[0].ImageData);
        //         // console.log(req.param('prophotoid'));
        //         let imagedata = rows[0].ImageData;
        //         fs.unlinkSync("./public/img/prophoto/" + imagedata);//delete uploaded photo
        //     } else {
        //         console.log(err);
        //     }
        // });

    });







    // // DELETE pro photo
    // Router.delete('/:prophotoid', function (req, res) {

    //         // fs.unlinkSync("./public/img/prophoto/" + req.param('imagedata'));//delete uploaded photo
    //     mysqlConnection.query("DELETE FROM pro_photo WHERE ID=?", req.param('prophotoid'), (err, rows, fields) => {
    //         if (!err) {
    //             res.send(rows);
    //         } else {
    //             console.log(err);
    //         }
    //     });
    // });
 








    //   // UPDATE
    // Router.post('/update', upload.single("Image"), [
    //     // check('degree', "Degree cannot be empty.").notEmpty(),
    //     // check('itemname', "Item name cannot be empty.").isInt({ min:1}),
    //     // check('photoname', "PhotoName cannot be empty.").notEmpty()
    //     // check('degree', "Degree cannot be empty.").isInt({ min:1, max: 2000}),
    //     // check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
    // ],
    //  function (req, res) {

    //         console.log(req.body);
    //         // console.log(req.file);

    //          const errors = validationResult(req);
    //         if (!errors.isEmpty()) {
    //             return res.status(422).json({ errors: errors.array() });
    //         }

    //         let post3 = req.body;
    
    //         let query = `UPDATE pro_photo  SET ? WHERE ID=?`;
    //         mysqlConnection.query(query, [post3, req.body.ID], (err, rows, fields) => {
    //             if (!err) {
    //                 res.send(rows);
    //                 // console.log(post3);
    //             } else {
    //                 console.log(err); 
    //             }
    //         });
    //     });











// // INSERT
// Router.post('/', upload.single("Image"),
//     [
//         // check('PhotoName', "PhotoName cannot be empty.").isInt({ gt: 0 }), if using list id
//         check('PhotoName', "PhotoName cannot be empty.").notEmpty()
//     ],

//     async function (req, res) {

//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(422).json({ errors: errors.array() });
//         }
 
//         try {

//             // Image 
//             if (req.file != undefined) {
//                 req.body.ImageData = req.file.filename
//             }

//             // Dates
//             var CreateDateTimestamp = await moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
//             var LastModifyDateTimestamp = await moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

//             // Maxid
//             let childid = await utils.maxid("Pro_Photo", "ID")// must use await for calling util common functions
//             const CalculatedID = childid.id + 1
            
//             // note '${req.body.Photo}', is not used for web version
            
//             let pool = await sql.connect(mssqlconfig)
//             let result = await pool.request()
//                 .query(`INSERT INTO  Pro_Photo (
//                 ID,
//                 PhotoName,
//                 CreatedBy,
//                 CreateDate,
//                 LastModifiedBy,
//                 LastModifyDate,
//                 ImageData,
//                 Description,
//                 ProjectID)
//                 VALUES (
//                 '${CalculatedID}',
//                 '${req.body.PhotoName}',
//                 '${req.body.CreatedBy}',
//                 '${CreateDateTimestamp}',
//                 '${req.body.LastModifiedBy}',
//                 '${LastModifyDateTimestamp}',
//                 '${req.body.ImageData}',
//                 '${req.body.Description}',
//                 '${req.body.ProjectID}')`)

//                 // res.send(result.rowsAffected)

//                 // Send ImageData to the front end to use it to show the image on the .imagetabdiv immidiately after save
//                 res.send(req.body.ImageData)

//         } catch (err) {
//             // return res.status(400).send("MSSQL ERROR: " + err);
//             // error used in this format to match with validation errors format for which our frontend is designed 
//             return res.status(500).send({ errors: [{ 'msg': err.message }] });
//         }
//     });





// // UPDATE
// Router.post('/update', upload.single("Image"),
//     [
//         // check('PhotoName', "PhotoName cannot be empty.").isInt({ gt: 0 }), if using list id
//         check('PhotoName', "PhotoName cannot be empty.").notEmpty()
//     ],

//     async function (req, res) {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(422).json({ errors: errors.array() });
//         }

//         try {

//             // IMAGE this is working for add and update. Nothng else is needed
//             if (req.file != undefined) {
//                 req.body.ImageData = req.file.filename
//             }
//             // if (req.body.ImageData == "") {
//             //     req.body.ImageData = req.file.filename
//             // }

//             // modifydate
//             var LastModifyDateTimestamp = await moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

//             // note Photo='${req.body.Photo}', is not used for web version
//             // CreateDate='${req.body.CreateDate}', shoud be as is no need to modify

//             let pool = await sql.connect(mssqlconfig)
//             let result = await pool.request()
//                 .query(`UPDATE Pro_Photo  SET 
//                     PhotoName='${req.body.PhotoName}',
//                     CreatedBy='${req.body.CreatedBy}',
//                     LastModifiedBy='${req.body.LastModifiedBy}',
//                     LastModifyDate='${LastModifyDateTimestamp}',
//                     ImageData='${req.body.ImageData}',
//                     Description='${req.body.Description}',
//                     ProjectID='${req.body.ProjectID}'
//                     WHERE ID=${req.body.ID}`)

//             // res.send(result.rowsAffected)
//             // Send ImageData to the front end to use it to show the image on the .imagetabdiv immidiately after save
//             res.send(req.body.ImageData)

//         } catch (err) {
//             // return res.status(400).send("MSSQL ERROR: " + err);
//             // error used in this format to match with validation errors format for which our frontend is designed 
//             return res.status(500).send({ errors: [{ 'msg': err.message }] });
//         }
//     });















module.exports = Router;
const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser')
const cors = require('cors');
const user= require('./routes/user');
const employee= require('./routes/employee/employee');
const empjobtitle= require('./routes/employee/empjobtitle');
const empreg= require('./routes/employee/empreg');
const empdegree= require('./routes/employee/empdegree');
const empcombo= require('./routes/employee/empcombo');
const empprojects= require('./routes/employee/empprojects');
const emptraining= require('./routes/employee/emptraining');
const empmembership= require('./routes/employee/empmembership');
const empexpsummary= require('./routes/employee/empexpsummary');
const empdisciplinesf330= require('./routes/employee/empdisciplinesf330');
const empprevemployment= require('./routes/employee/empprevemployment');

const project= require('./routes/project/project');
const procombo= require('./routes/project/procombo');
const proteam= require('./routes/project/proteam');
const proaddress= require('./routes/project/proaddress');
const proownercontact= require('./routes/project/proownercontact');
const proclientcontact= require('./routes/project/proclientcontact');

const prodac= require('./routes/project/prodac');
const prodescription= require('./routes/project/prodescription');
const prophoto= require('./routes/project/prophoto');
const proprofilecode= require('./routes/project/proprofilecode');
const cao= require('./routes/cao/cao');
const com= require('./routes/com/com');
const proposal = require('./routes/proposal/proposal');

const authenticateToken= require('./middleware/authenticateToken');// to use authenticateToken globally fron user module
const multer = require('multer');

//
//Body Parser Middleware
// *************************************************
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());

app.options('*', cors()) // include before other routes 
app.use(cors());

 
//local Middlewares. Put before routes to work. To use authenticateToken globally declared in user module
// *************************************************
//  app.use(authenticateToken);        


// to stop render.com from failed service(server unhealthy)
// https://stackoverflow.com/questions/72150113/nodejs-app-build-is-successful-render-but-application-error-in-render-at-the-l
app.get('/healthz/', (req, res) => {
    res.sendStatus(200)
})

 
//Local Routes
// *************************************************
app.use('/api/users', user);
app.use('/api/employee', employee);
// app.use('/api/employee',authenticateToken, employee); // use authenticateToken for all functions in this route
app.use('/api/empjobtitle', empjobtitle);
app.use('/api/empreg', empreg);
app.use('/api/emptraining',emptraining);
app.use('/api/empmembership',empmembership);
app.use('/api/empexpsummary',empexpsummary);
app.use('/api/empdisciplinesf330',empdisciplinesf330);
app.use('/api/empprevemployment',empprevemployment);

app.use('/api/empdegree', empdegree);
app.use('/api/empprojects', empprojects);
app.use('/api/empcombo', empcombo);
//project
app.use('/api/project', project);
app.use('/api/procombo', procombo);
app.use('/api/proteam', proteam);
app.use('/api/prodac', prodac);
app.use('/api/prodescription', prodescription);
app.use('/api/prophoto', prophoto);
app.use('/api/proprofilecode', proprofilecode);
app.use('/api/proaddress', proaddress);
app.use('/api/proownercontact', proownercontact);
app.use('/api/proclientcontact', proclientcontact);

//cao
app.use('/api/cao', cao);
//com
app.use('/api/com', com);
//proposal
app.use('/api/proposal', proposal);




// to catch all general errors and multer err
// https://expressjs.com/en/guide/error-handling.html
app.use((err, req, res, next) => {
    // console.error(err.stack)
    // res.status(500).send('Something broke!')
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        res.status(500).send("Multer Error : " + err.message)
    } else if (err) {
        // res.send("An unknown error occurred when uploading.");
        res.send(err.message);
    }
})

// //Configure port
// //**************************************************** */
// const PORT = process.env.PORT || 10000; //5000;
// app.listen(PORT, function(){
//     console.log(`Connected to Server on PORT: ${PORT}`);
// });

 

//Configure port
//**************************************************** */
const PORT = process.env.PORT || 5000;
app.listen(PORT, function(err){
    if (err) console.log("Error in server setup")
    console.log(`Connected to Server on PORT: ${PORT}`);
});
 


//Set View Engine
//**************************************************** */
app.set('view engine','ejs');
app.set('views', path.join(__dirname, '/views'));
// app.engine('html', ejs.renderFile);


// app.get('/', function(req, res){
//     res.send('Hello World2');
// });

// app.get('/', function(req, res){
//     res.sendFile(path.join(__dirname,"public","Hello.html"));
// });



// Set static folder to avoid above code https://www.youtube.com/watch?v=L72fhGm1tfE
// to use common folders <link rel="stylesheet" href="css/style.css">
// ***************************************************************************************
app.use(express.static(path.join(__dirname, 'public')));


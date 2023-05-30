require('dotenv').config();
const express = require('express');
const Validator = require('Validator');
const session = require('express-session');
var multer = require('multer');
var path = require('path');
var app = express();
app.use(express.json());
var ejs = require('ejs').renderFile;
app.use(express.urlencoded({extended:false}));

app.use('/v1/api_document/',require('./modules/v1/api_document/index'))

const auth = require('./modules/v1/auth/route');
app.use('/',require('./middleware/validator').validateApi);
app.use('/',require('./middleware/validator').validateHeaderToken);
app.use('/',require('./middleware/validator').extractHeaderLanguage);
app.use('/api/v1/auth', auth);
const services = require('./modules/v1/services/route');
app.use('/api/v1/services', services);
app.engine('html',ejs)
app.set('view engine','html');


try {
    app.listen(process.env.PORT);
    console.log('server connected on PORT: ' + process.env.PORT);
} catch (error) {
    console.log('connection error :( ');
}
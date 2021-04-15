const express = require('express');
const ejs = require('ejs');

const path = require('path');
const staticPath = path.join(__dirname, '../client/static/');
const viewPath = path.join(__dirname, '../client/views/');
const router = require('./router')

const app = express();
// app.set('view engine', 'ejs');
// app.set('views', viewPath);

//  For debugging purposes, I log the URL of requests.
app.use((req, res, next)=>{console.log(req.originalUrl); next();})
app.use(express.static(staticPath));
app.use('/', router);


app.listen(5000);
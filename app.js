/*jslint node: true, es6 */

"use strict";

var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var winston = require('winston');

// var indexRouter = require('./routes/index');
var softsRouter = require('./routes/softs');
var statsRouter = require('./routes/stats');

const myconsole = new (winston.transports.Console)({
    timestamp: true
});
winston.loggers.add('softmngr', {
    transports: [myconsole]
});

var app = express();

app.use(cors());
app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'ui')));
// app.use('/', indexRouter);
app.use('/soft', softsRouter);
app.use('/stat', statsRouter);

module.exports = app;

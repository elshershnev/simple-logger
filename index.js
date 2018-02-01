'use strict';


const loggers = require('./loggers');
const simplelogger = require('./simplelogger.js');
const transports = require('./transports');


simplelogger.transports = transports;
simplelogger.loggers = loggers;


module.exports = simplelogger;

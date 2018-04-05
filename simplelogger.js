'use strict';


const loggers = require('./loggers');


class SimpleLogger {


  constructor() {

    this._loggers = {
      default: new loggers.Logger(
        'default_simple_logger',
        {
          boubdaryLevel: 'INFO',
        }
      ),
    };
  }


  getLoggerNames() {
    const names = [];
    for (let name in this._loggers) {
      names.push(name);
    }
    return names;
  }


  getLogger(name) {
    return this._loggers[name];
  }


  add(logger) {
    if (!(logger instanceof loggers.Logger)) {
      throw new Error('You can add only Logger instance');
    }

    if (logger.name in this._loggers) {
      throw new Error('Logger with name ' + logger.name +
            ' already presented');
    }

    this._loggers[logger.name] = logger;
  }


  remove(name) {
    if (name === 'default') {
      throw new Error('You cannot delete default logger');
    }
    delete this._loggers[name];
  }


  log(name, level, logEntry) {
    const len = arguments.length;

    switch (len) {
      case 3: break;
      case 2: logEntry = level; level = name; name = 'default'; break;
      case 1: logEntry = name; level = 'INFO'; name = 'default'; break;
      default: throw new Error('Wrong number of argument');
    }
    if (name in this._loggers) {
      return this._loggers[name].log(level, logEntry);
    } else {
      throw new Error('Logger with name ' + name + ' is not found');
    }
  }


  info(name, logItem) {
    if (!logItem) {
      logItem = name;
      name = 'default';
    }
    return this.log(name, 'INFO', logItem);
  }


  error(name, logItem) {
    if (!logItem) {
      logItem = name;
      name = 'default';
    }
    return this.log(name, 'ERROR', logItem);
  }


  warn(name, logItem) {
    if (!logItem) {
      logItem = name;
      name = 'default';
    }
    return this.log(name, 'WARN', logItem);
  }


  verbose(name, logItem) {
    if (!logItem) {
      logItem = name;
      name = 'default';
    }
    return this.log(name, 'VERBOSE', logItem);
  }


  debug(name, logItem) {
    if (!logItem) {
      logItem = name;
      name = 'default';
    }
    return this.log(name, 'DEBUG', logItem);
  }


  silly(name, logItem) {
    if (!logItem) {
      logItem = name;
      name = 'default';
    }
    return this.log(name, 'SILLY', logItem);
  }

}


module.exports = new SimpleLogger();

'use strict';


const transports = require('../transports');


class Logger {


    constructor(name, options) {

        if (typeof name !== 'string') {
            throw new Error('Name for new logger is required');
        }
        else {
            this.name = name;
        }

        // boundaryLevel
        this.boundaryLevel = options.boundaryLevel ?
                             options.boundaryLevel.toUpperCase() :
                             'INFO';

        // transports
        if (options.transports) {
            if (Array.isArray(options.transports)) {
                this.transports = [];
                options.transports.forEach(function(transport) {
                    if (transport instanceof transports.TransportBase) {
                        this.transports.push(transport);
                    } else {
                        throw new Error('Each transports in transport must ' +
                            'be inheritor of TransportBase'
                        );
                    }
                }.bind(this));
            }
            else {
                throw new Error('trasports must be an Array');
            }
        }
        else {
            this.transports = [new transports.Console()];
        }

        // formatter
        if (options.formatter) {
            if (typeof options.formatter !== 'function') {
                throw new Error('formatter must be a function');
            }
            this.formatter = options.formatter;
        }
        else {
            this.formatter = function (loggerName, JSTime, level, logItemId, logItem) {
                const time = new Date(JSTime).toTimeString();
                const logItemParts = [loggerName.toUpperCase(), time, logItemId, level];
                if (typeof logItem != 'object') {
                    logItemParts.push(String(logItem));
                }
                else {
                    logItemParts.push(JSON.stringify(logItem));
                }
                return logItemParts.join(' : ');
            };
        }

    }


    log(level, logItem) {
        level = level.toUpperCase();

        const levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            VERBOSE: 3,
            DEBUG: 4,
            SILLY: 5
        };

        if (!(level in levels)) {
            throw new Error('Invalid log level');
        }

        if (levels[level] <= levels[this.boundaryLevel]) {
            const now = new Date().getTime();
            let logItemId = now.toString(36);
            logItemId += logItemId.split('').filter(() => {return Math.random() - 0.5}).join('') + logItemId;
            logItemId = logItemId.slice(10);

            logItem = this.formatter(this.name, now, level, logItemId, logItem);

            this.transports.forEach(function(transport) {
                transport.log(logItem);
            });

            return logItemId;
        }
    }


    info(logItem) {
        return this.log('INFO', logItem);
    }


    error(logItem) {
        return this.log('ERROR', logItem);
    }


    warn(logItem) {
        return this.log('WARN', logItem);
    }


    verbose(logItem) {
        return this.log('VERBOSE', logItem);
    }


    debug(logItem) {
        return this.log('DEBUG', logItem);
    }


    silly(logItem) {
        return this.log('SILLY', logItem);
    }

}


module.exports = {
    Logger: Logger
};

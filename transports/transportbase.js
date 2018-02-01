'use strict';


class TransportBase {


    constructor(options) {

        if (!options) {
            options = {};
        }

        this.name = options.name || 'default';

        this._fileName = options.fileName;
        this._filePath = options.filePath || __dirname + '/logs';
    }


    log(item) {
        throw new Error('Not implemented');
    }

}


module.exports = {
    TransportBase: TransportBase
};

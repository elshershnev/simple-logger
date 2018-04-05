'use strict';


const transportbase = require('./transportbase');


class Console extends transportbase.TransportBase {

  constructor(options) {

    super(options);

    this.writable = console;
  }


  log(item) {
    this.writable.log(item);
  }
}


module.exports = {
  Console: Console,
};

'use strict';


const fs = require('fs');
const path = require('path');
const zlib = require('zlib');


const transportbase = require('./transportbase');


class File extends transportbase.TransportBase {

  constructor(options) {

    super(options);

    this._buffer = [];

    const fileName = this._fileName;
    const filePath = this._filePath;

    if (!fileName) {
      throw new Error('fileName is required to create File transport');
    } else {
      if (!path.isAbsolute(filePath)) {
        throw new Error('Path in filePath option must be absolute');
      }

      const dirs = filePath.split('/');

      // Check and create path to log file if it doesn't exist
      for (let i = 2; i <= dirs.length; i++) {
        let t = dirs.slice(0, i).join('/');
        try {
          fs.accessSync(t);
        } catch (e) {
          if (e.code !== 'ENOENT') {
            throw new Error('Cannot access directory ' + t +
                            '. Details: ' + JSON.stringify(e)
            );
          }
          try {
            fs.mkdirSync(t);
          } catch (e) {
            if (e.code !== 'EEXIST') {
              throw new Error('Cannot create directory ' + t +
                                '. Details: ' + JSON.stringify(e)
              );
            }
          }

        }
      }

      // TODO use join here
      const target = path.join(filePath, fileName);

      this.writable = fs.createWriteStream(target, {flags: 'a'});

      this._duplicateToConsole = options.duplicateToConsole || false;

      // TODO add isNeedRotation
      if (options.rotationParameters) {
        this._rotationParameters = {};
        // rotation interval in mlliseconds
        this._rotationParameters.interval =
          options.rotationParameters.interval || 86400000;
        this._rotationParameters.compress =
          options.rotationParameters.compress || false;
        this._rotationParameters.keepLogs =
          options.rotationParameters.keepLogs || 30;

        this._timerId = setInterval(
          () => { this.rotate(); },
          this._rotationParameters.interval
        );
      }
    }
  }


  stopRotation() {
    clearInterval(this._timerId);
  }


  _lock() {
    this.isLocked = true;
  }


  _unlock() {
    this.isLocked = false;
  }


  rotate() {
    this._lock();

    this._rotate(
      this._fileName,
      this._filePath,
      this._rotationParameters.compress,
      this._rotationParameters.keepLogs,
      () => { this._unlock(); }
    );
  }


  _rotate(fileName, filePath, compress, keepLogs, callback) {

    const tasks = [];
    const names = [];

    for (let i = keepLogs - 2; i > 0; i--) {
      names.push({
        oldFile: path.join(filePath, fileName + '.' + i),
        newFile: path.join(filePath, fileName + '.' + (i + 1)),
      });
      names.push({
        oldFile: path.join(filePath, fileName + '.' + i + '.gz'),
        newFile: path.join(filePath, fileName + '.' + (i + 1) + '.gz'),
      });
    }

    names.forEach(function(item){
      let oldFile = item.oldFile;
      let newFile = item.newFile;

      let task;
      task = function() {
        fs.rename(oldFile, newFile, function(err) {
          if (err) {
            if (err.code !== 'ENOENT') {
              callback();
              throw new Error('Cannot rename ' + oldFile +
                                    ' to ' + newFile + '. Details: ' + err);
            }
            fs.unlink(newFile, function(err) {
              // TODO to think about throwing an exception here
              if (err) {
                console.log('Cannot delete file ' + newFile +
                  'because of error. Details: ' + err);
              }
            });
          }
          const task = tasks.shift();
          if (!task) {
            // all files were renamed
            let source = fs.createReadStream(path.join(filePath, fileName));
            let target;

            if (compress) {
              target = fs.createWriteStream(
                path.join(filePath, fileName + '.1.gz')
              );
            } else {
              target = fs.createWriteStream(
                path.join(filePath, fileName + '.1')
              );
            }

            source.on('close', function() {
              const fn = path.join(filePath, fileName);
              fs.truncate(fn, function(err) {
                callback();
                if (err) {
                  throw new Error('Cannot truncate ' +
                                                'log file ' + fn
                  );
                }
              });
            });

            if (compress) {
              const z = zlib.createGzip();
              source.pipe(z).pipe(target);
            } else {
              source.pipe(target);
            }
          } else {
            task();
          }
        });
      };
      tasks.push(task);

    });
    const task = tasks.shift();
    task();
  }


  _log(item) {
    this.writable.write(item + '\n');
    if (this._duplicateToConsole) {
      console.log(item);
    }
  }


  log(item) {
    if (!this.isLocked) {
      if (!this._buffer.length) {
        this._log(item);
      } else {
        this._buffer.forEach((item) => {
          this._log(item);
        });
        this._buffer = [];
        this._log(item);
      }
    } else {
      this._buffer.push(item);
    }
  }
}

module.exports = {
  File: File,
};

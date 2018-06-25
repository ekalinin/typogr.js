#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    commander = require('commander'),
    async = require('async'),
    glob = require('glob'),
    mkdirp = require('mkdirp'),
    typogr = require('./typogr');


function isDirectory(pathString) {
  try {
    // Query the entry
    return fs.statSync(pathString).isDirectory();
  }
  catch (error) {
    // if file doesn't exist, statSync throws an error instead of just returning false
    return false;
  }
}

// path.dirname and path.basename don't always work right, so we have to create our own functions
function dirname(pathString) {
  return pathString.substring(0, pathString.lastIndexOf('/') + 1);
}

function basename(pathString) {
  return pathString.substring(pathString.lastIndexOf('/') + 1);
}

function readRenderWrite(input, output, force) {
  input = path.normalize(input);
  output = path.normalize(output);

  if(isDirectory(input))
    input = input + '/**';  // add glob to get all files under directory

  var inputDirectory = dirname(input),
      inputGlob = basename(input),
      after,
      outputString;

  // process input
  glob(inputGlob, { cwd: inputDirectory }, function (error, files) {
    async.eachSeries(files, function (file, eachCallback) {
      // only process files; other types such as directories or links are ignored
      fs.stat(inputDirectory + '/' + file, function (error, stats) {
        if(stats.isFile()) {
          // read file
          fs.readFile(inputDirectory + '/' + file, 'utf8', function (error, before) {
            // process the html
            after = typogr.typogrify(before);
            // write file
            if(output === '/dev/stdout') // writeFile doesn't like /dev/stdout even though readFile works with /dev/stdin
              console.log(after);
            else {
              if(files.length > 1) {
                // multiple input files means we are dealing with a directory or a glob,
                // so make sure directory exists
                mkdirp.sync(output + '/' + dirname(file));
                outputString = path.normalize(output + '/' + file);
              }
              else // one input file means we are only writing one file
                outputString = output;
              if(force) {
                fs.writeFile(outputString, after, function (error) {
                  eachCallback(error);
                });
              }
              else {
                confirmOverwrite(outputString, function (ok) {
                  if(ok)
                    fs.writeFile(outputString, after, function (error) {
                      eachCallback(error);
                    });
                });
              }
            }
          });
        }
        else
          eachCallback(null);
      });
    }, function (error) {
      if(error) throw error;
    });
  });
}

function confirmOverwrite(fileName, callback) {
  fs.stat(fileName, function(error, stats) {
    if(stats) {
      if(stats.isFile()) {
        commander.confirm('Confirm: overwrite file (' + fileName + ')? ', function(ok) {
          // work around bug in commander.js 
          // see (https://github.com/visionmedia/commander.js/issues/109)
          // also see (https://github.com/visionmedia/commander.js/pull/133)
          process.stdin.pause();

          if(ok)
            callback(true);
          else {
            console.log("  Cancelling action, file wasn't modified.");
            callback(false);
          }
        });
      }
      else {
        // fileName is not of type 'file' (close our eyes and assume it's a directory)
        callback(true);
      }
    }
    else {
      // fileName doesn't exist
      callback(true);
    }
  });
}


function main() {
  // specify cli options
  commander
    .version('0.6.8')
    .usage('[options] [input] [output]')
    .option('-i, --inplace', 'Use single path as both input and output')
    .option('-f, --force', 'Do not prompt to verify file overwrites');

  // specify example help text
  commander.on('--help', function() {
    console.log('  reads input from stdin, individual files, directories, or globs');
    console.log('  writes ouput to stdout, individual files, or directories');
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    $ typogr inputFile.html outputFile.html');
    console.log('    $ typogr < inputFile.html > outputFile.html');
    console.log('    $ typogr -i singleFile.html');
    console.log('    $ typogr inputDirectory outputDirectory');
    console.log('    $ typogr inputDirectory/*.html outputDirectory');
    console.log('');
  });

  // parse arguments and generate object mappings in the *commander* object
  commander.parse(process.argv);

  switch (commander.args.length) {
    case 0:
      // get input from stdin and send output to stdout
      readRenderWrite('/dev/stdin', '/dev/stdout');
      break;
    case 1:
      if (commander.inplace) {
        // modify the file in place
        readRenderWrite(commander.args[0], commander.args[0], commander.force);
      }
      else {
        // get input from file specified and send output to stdout
        readRenderWrite(commander.args[0], '/dev/stdout');
      }
      break;
    case 2:
      // get input from first parameter and send output to second parameter
      readRenderWrite(commander.args[0], commander.args[1], commander.force);
      break;
  }

}


module.exports.main = main;

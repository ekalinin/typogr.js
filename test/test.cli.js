var should = require('should'),
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec,
    rimraf = require('rimraf'),
    glob = require('glob'),
    mkdirp = require('mkdirp'),
    typogr = require('../typogr');



describe('./bin/typogr', function () {

  // variables used throughout the tests

  var testText = '<h2>"Jayhawks" & KU fans act extremely obnoxiously</h2>',
    renderedText = '<h2><span class="dquo">&#8220;</span>Jayhawks&#8221; <span class="amp">&amp;</span> <span class=\"caps\">KU</span> fans act extremely<span class="widont">&nbsp;</span>obnoxiously</h2>',
    testDir = '/var/tmp/typogr/',
    inputDir = testDir + 'input/',
    inputFiles = [ 'file1.html',
                  'file2.html',
                  'file3.html',
                  'firstleveldir/file4.html',
                  'firstleveldir/secondleveldir/file5.html',
                  'firstleveldir/secondleveldir/file6.html'
                ],
    outputDir = testDir + '/output';

  // run before every test

  beforeEach(function () {
    // create input files
    inputFiles.forEach(function (fileName) {
      mkdirp.sync(path.dirname(inputDir + fileName));
      fs.writeFileSync(inputDir + fileName, testText);
    });

  });

  it('should create test files', function (done) {
    glob(inputDir + '**', { cwd: testDir }, function (error, files) {
      files.should.have.length(9);
      done();
    });
  });

  it('should have test files with expected contents', function (done) {
    var stats, contents;
    glob(inputDir + '**', { cwd: testDir }, function (error, files) {
      if(error) throw error;
      files.forEach(function (fileName) {
        stats = fs.statSync(fileName);
        if(stats.isFile()) {
          contents = fs.readFileSync(fileName, 'utf8');
          contents.should.equal(testText);
        }
      });
      done();
    });
  });

  it('# should take input from stdin and output to stdout', function (done) {
    var stdout = "";
    var typogr = spawn('./bin/typogr', [inputDir + inputFiles[0]]);
    typogr.stdin.write(testText);
    typogr.stdin.end();
    typogr.stdout.on('data', function (data) {
      stdout += data;
    });
    typogr.on('exit', function (code) {
      if(code) throw code;
      stdout.should.equal(renderedText + '\n');
      done();
    });
  });

  it('# should overwrite input file in place ( -if)' + inputDir + inputFiles[0],
   function (done) {
    exec('./bin/typogr -if ' + inputDir + inputFiles[0], function (error, stdout, stderr) {
      if(error) throw error;
      // make sure file now has rendered text
      var contents = fs.readFileSync(inputDir + inputFiles[0], 'utf8');
      contents.should.equal(renderedText);
      done();
    });
  });

  it('# should read from one file and write to another', function (done) {
    exec('./bin/typogr ' + inputDir + inputFiles[0] + ' ' + outputDir + inputFiles[0],
      function (error, stdout, stderr) {
        if(error) throw error;
        // make sure file now has rendered text
        var contents = fs.readFileSync(outputDir + inputFiles[0], 'utf8');
        contents.should.equal(renderedText);
        done();
    });
  });

  it('# should read from one directory and write to another', function (done) {
    exec('./bin/typogr ' + inputDir + ' ' + outputDir, function (error, stdout, stderr) {
      if(error) throw error;
      // make sure file now has rendered text in each file
      glob(outputDir + '**', { cwd: testDir }, function (error, files) {
        if(error) throw error;
        files.forEach(function (fileName) {
          if(fs.statSync(fileName).isFile()) {
            contents = fs.readFileSync(fileName, 'utf8');
            contents.should.equal(renderedText);
          }
        });
        done();
      });
    });
  });

  it('# should process glob: /**', function (done) {
    exec('./bin/typogr ' + inputDir + '** ' + outputDir, function (error, stdout, stderr) {
      if(error) throw error;
      // make sure file now has rendered text in each file
      glob(outputDir + '**', { cwd: testDir }, function (error, files) {
        if(error) throw error;
        files.forEach(function (fileName) {
          stats = fs.statSync(fileName);
          if(stats.isFile()) {
            contents = fs.readFileSync(fileName, 'utf8');
            contents.should.equal(renderedText);
          }
        });
        done();
      });
    });
  });

  it('# should prompt for confirmation to overwrite single file: negative response', function (done) {
    // in place modification of a single file
    // test negative response
    var buffer,
        response = false,
        typogr = spawn('./bin/typogr', ['-i', inputDir + inputFiles[0]]);
    typogr.stdout.on('readable', function () {
      buffer = typogr.stdout.read(null);
      if (/Confirm: overwrite file \(.+\)\? /.test(buffer))
        typogr.stdin.end('n\n');
      else {
        if (/Cancelling action, file wasn't modified\./.test(buffer)) {
          response = true;
        }
        else
          if (!response) {
            throw 'unexpected text found!';
          }
      }
    });
    typogr.on('exit', function (error) {
      if(error) throw error;
      response.should.equal(true);
      done();
    });
  });

  it('# should prompt for confirmation to overwrite single file: positive response', function (done) {
    // test positive response
    var buffer,
        response = false,
        typogr = spawn('./bin/typogr', ['-i', inputDir + inputFiles[0]]);
    typogr.stdout.on('readable', function () {
      buffer = typogr.stdout.read(null);
      if (/Confirm: overwrite file \(.+\)\? /.test(buffer)) {
        response = true;
        typogr.stdin.end('y\n');
      }
      else
        if (!response) {
          throw 'unexpected text found!';
        }
    });
    typogr.on('exit', function (error) {
      if(error) throw error;
      response.should.equal(true);
      done();
    });

  });

  it('# should prompt for confirmation of each overwritten file when writing from an input directory to an output directory', function (done) {
    // we should get prompted for each file overwrite
    var buffer,
        confirmCount = 0,
        typogr = spawn('./bin/typogr', [inputDir, inputDir]);
    typogr.stdout.on('readable', function () {
      buffer = typogr.stdout.read(null);
      if (/Confirm: overwrite file \(.+\)\? /.test(buffer)) {
        typogr.stdin.write('y\n');
        ++confirmCount;
      }
      else
        if (buffer)
        throw 'unexpected text found!';
    });

    // wait for cli interactions to complete
    setTimeout(function () {
      typogr.stdin.end();
    }, 1000);

    typogr.on('exit', function (code) {
      if(code) throw code;
      confirmCount.should.equal(6);
      done();
    });
  });

  it('# should prompt for confirmation of each overwritten file when writing from an input glob to an output directory', function (done) {
    // we should get prompted for each file overwrite
    var buffer,
        confirmCount = 0,
        typogr = spawn('./bin/typogr', [inputDir, inputDir]);
    typogr.stdout.on('readable', function () {
      buffer = typogr.stdout.read(null);
      if (/Confirm: overwrite file \(.+\)\? /.test(buffer)) {
        typogr.stdin.write('y\n');
        ++confirmCount;
      }
      else
        if (buffer)
        throw 'unexpected text found!';
    });

    // wait for cli interactions to complete
    setTimeout(function () {
      typogr.stdin.end();
    }, 1000);

    typogr.on('exit', function (code) {
      if(code) throw code;
      confirmCount.should.equal(6);
      done();
    });
  });

  // run after every test
  afterEach(function (done) {
    // remove all test files in testDir (equivalent to `rm -rf`)
    rimraf(testDir, function (error) {
      if(error) throw error;
      done();
    });
  });

});

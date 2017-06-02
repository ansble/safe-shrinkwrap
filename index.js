#!/usr/bin/env node
'use strict';
var path = require('path')
  , cp = require('child_process')
  , Promise = require('bluebird')
  , fs = Promise.promisifyAll(require('fs'))
  , glob = Promise.promisify(require('glob'))
  , ora = require('ora')
  , commandModule = require('./modules/command')
  , pkg = require('./package')
  , spinner = ora({
    text: 'The hamsters are working... ' // Trailing space to separate any warnings/errors
    , spinner: 'star'
  })

  , command = commandModule.build(process.argv)
  , isProblematic = function (badDeps) {
      return function (name) {
        return badDeps.indexOf(name) !== -1;
      };
  }

  , cleanDependencies = require('./modules/cleanDependencies');

if (process.argv.indexOf('-v') >= 0 || process.argv.indexOf('--version') >= 0) {
  console.log(pkg.version);
  process.exit(0);
}

if (process.argv.indexOf('-h') >= 0 || process.argv.indexOf('--help') >= 0) {
  console.log(`safe-shrinkwrap version: ${pkg.version}`);
  console.log('');
  console.log(`    -ni, --no-install : doesn't install`)
  console.log(`    -ndd, --no-dedupe : don't run npm dedupe`)
  console.log(`    -nd, --no-dev : don't include dev dependencies`)
  console.log(`    -rs, --remove-shrinkwrap : delete the shrinkwrap file first`)
  console.log(`    -v, --version : outputs just the version`)
  console.log(`    -h, --help : outputs this help information`)
  process.exit(0);
}

if (commandModule.shouldInstall(process.argv)) {
  console.log('Clearing NPM cache and proceeding to reinstall before we shrinkwrap');
}

spinner.start();

if (commandModule.shouldRemoveShrinkwrap(process.argv)) {
  try {
    if (fs.statSync('./npm-shrinkwrap.json').isFile()) {
      fs.unlinkSync('./npm-shrinkwrap.json')
    }
  } catch (e) {
  }
}

cp.exec(command, function (err, stdout, stderr) {
  Promise.try(() => {
    if (err) throw err;
  })
  .then(() => {
    return glob('./node_modules/**/package.json');
  })
  .then((files) => {
    var shrinkwrapped = require(path.join(process.cwd(), './npm-shrinkwrap.json'))
      , badDeps = files.reduce(function (accum, file) {
          try {
            var depDetails = require(path.join(process.cwd(), file));

            if (typeof depDetails.os !== 'undefined') {
              accum.push(depDetails.name);
            }
          } catch (e) {
          }

          return accum;
        }, [])
      , clean = cleanDependencies(shrinkwrapped.dependencies || {}, isProblematic(badDeps))
      , finalObj = JSON.parse(JSON.stringify(shrinkwrapped));

    finalObj.dependencies = clean;

    return Promise.all([
      fs.writeFileAsync(path.join(process.cwd(), './npm-shrinkwrap.json'), JSON.stringify(finalObj)),
      fs.writeFileAsync(path.join(process.cwd(), './npm-shrinkwrap.unsafe.json'), JSON.stringify(shrinkwrapped))
    ]);
  })
  .then(() => {
    spinner.succeed("The hamsters are done! So is your shrinkwrap file.");
  })
  .catch((err) => {
    console.error(err);
    spinner.fail("The hamsters have failed.");
    process.exitCode = err.code || 1;
  });
}).stderr.pipe(process.stderr); // Pipe child process stderr, so user can see any warnings

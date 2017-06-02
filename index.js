#!/usr/bin/env node
'use strict';
var path = require('path')
  , cp = require('child_process')
  , fs = require('fs')
  , glob = require('glob')
  , ora = require('ora')
  , commandModule = require('./modules/command')
  , pkg = require('./package')
  , spinner = ora({
    text: 'The hamsters are working...'
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
  console.log('Clearing NPM cache and Proceeding to reinstall before we shrinkwrap');
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
  if (err) {
    console.log(err);
    return;
  }

  glob('./node_modules/**/package.json', function (err, files) {
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

    fs.writeFile(path.join(process.cwd(), './npm-shrinkwrap.json'), JSON.stringify(finalObj), (err) => {
      if (err) {
        console.error(err);
      }
    });

    fs.writeFile(path.join(process.cwd(), './npm-shrinkwrap.unsafe.json'), JSON.stringify(shrinkwrapped), (err) => {
      if (err) {
        console.error(err);
      }
    });

    spinner.stop();

    console.log("They're done! So is your shrinkwrap file.");
  });
});

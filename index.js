#!/usr/bin/env node
'use strict';
var path = require('path')
  , cp = require('child_process')
  , fs = require('fs')
  , glob = require('glob')
  , ora = require('ora')
  , pkg = require('./package')
  , spinner = ora({
    text: 'The hamsters are working...'
    , spinner: 'star'
  })

  , shouldInstall = process.argv.indexOf('--no-install') === -1 && process.argv.indexOf('-ni') === -1
  , command = shouldInstall ?
      'npm cache clear && npm install && npm prune && npm shrinkwrap --dev' :
      'npm prune && npm dedupe && npm shrinkwrap --dev'

  , isProblematic = function (badDeps) {
      return function (name) {
        return badDeps.indexOf(name) !== -1;
      };
  }

  , cleanDependencies = function (depObject, testFunction) {
    return Object.keys(depObject).reduce(function (result, key) {
      if (!testFunction(key)) {
        if ( depObject[key].dependencies) {
          result[key] = depObject[key];
          result[key].dependencies = cleanDependencies(depObject[key].dependencies, testFunction);
        } else {
          result[key] = depObject[key];
        }
      }

      return result;
    }, {});
  };

if (process.argv.indexOf('-v') >= 0 || process.argv.indexOf('--version') >= 0) {
  console.log(pkg.version);
  process.exit(0);
}

if (process.argv.indexOf('-h') >= 0 || process.argv.indexOf('--help') >= 0) {
  console.log(`safe-shrinkwrap version: ${pkg.version}`);
  console.log('');
  console.log(`    -ni, --no-install : doesn't install`)
  console.log(`    -v, --version : outputs just the version`)
  console.log(`    -h, --help : outputs this help information`)
  process.exit(0);
}

if (shouldInstall) {
  console.log('Clearing NPM cache and Proceeding to reinstall before we shrinkwrap');
}

spinner.start();

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

    fs.writeFile(path.join(process.cwd(), './npm-shrinkwrap.json'), JSON.stringify(finalObj));
    fs.writeFile(path.join(process.cwd(), './npm-shrinkwrap.unsafe.json'), JSON.stringify(shrinkwrapped));
    spinner.stop();

    console.log("They're done! So is your shrinkwrap file.");
  });
});

#!/usr/bin/env node
'use strict';
var path = require('path')
  , cp = require('child_process')
  , fs = require('fs')
  , glob = require('glob')
  , ora = require('ora')
  , spinner = ora({
    text: 'The hamsters are working...'
    , spinner: 'star'
  })
  , installArg = process.argv.pop()
  , shouldInstall = installArg === '--install' || installArg === '-i'
  , command = shouldInstall ?
      'npm cache clear && npm install && npm prune && npm dedupe && npm shrinkwrap --dev' :
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
      , clean = cleanDependencies(shrinkwrapped.dependencies, isProblematic(badDeps))
      , finalObj = JSON.parse(JSON.stringify(shrinkwrapped));

    finalObj.dependencies = clean;

    fs.writeFile(path.join(process.cwd(), './npm-shrinkwrap.json'), JSON.stringify(finalObj));
    fs.writeFile(path.join(process.cwd(), './npm-shrinkwrap.unsafe.json'), JSON.stringify(shrinkwrapped));
    spinner.stop();

    console.log("They're done! So is your shrinkwrap file.");
  });
});

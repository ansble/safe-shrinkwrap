#!/usr/bin/env node
'use strict';
var path = require('path')
  , cp = require('child_process')
  , fs = require('fs')
  , isProblematic = function (name) {
    var badDeps = ['fsevents', 'canvas', 'dbus'];

    return badDeps.indexOf(name) !== -1;
  }

  , cleanDependencies = function (depObject) {
    return Object.keys(depObject).reduce(function (result, key) {
      if (!isProblematic(key)) {
        if ( depObject[key].dependencies) {
          result[key] = depObject[key];
          result[key].dependencies = cleanDependencies(depObject[key].dependencies);
        } else {
          result[key] = depObject[key];
        }
      } else {
        console.log('Bad DEP!', key);
      }

      return result;
    }, {});
  };

cp.exec('npm prune && npm shrinkwrap --dev', function (err, stdout, stderr) {
  if (err) {
    console.log(err);
    return;
  }

  var shrinkwrapped = require(path.join(process.cwd(), './npm-shrinkwrap.json'))
    , clean = cleanDependencies(shrinkwrapped.dependencies)
    , finalObj = JSON.parse(JSON.stringify(shrinkwrapped));

  finalObj.dependencies = clean;

  fs.writeFile(path.join(process.cwd(), './npm-shrinkwrap.json'), JSON.stringify(finalObj));
  fs.writeFile(path.join(process.cwd(), './npm-shrinkwrap.unsafe.json'), JSON.stringify(shrinkwrapped));
});

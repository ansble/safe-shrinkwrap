#!/usr/bin/env node
'use strict';
var path = require('path')
  , cp = require('child_process')
  , fs = require('fs')
  , isProblematic = function (name) {
    var badDeps = ['fsevents', 'canvas', 'dbus'];

    return badDeps.indexOf === -1;
  }

  , cleanDependencies = function (depObject) {
    return Object.keys(depObject).reduce(function (result, key) {
      if ( depObject[key].dependencies) {
        result[key] = cleanDependencies(depObject[key].dependencies);
      } else {
        if (!isProblematic(key)) {
          result[key] = depObject[key];
        } else {
          console.log('Bad DEP!', key);
        }
      }

      return result;
    }, {});
  };

cp.exec('npm shrinkwrap --dev', function (err, stdout, stderr) {
  var shrinkwrapped = require(path.join(process.cwd(), './npm-shrinkwrap.json'))
    , clean = cleanDependencies(shrinkwrapped.dependencies);

  fs.writeFile(path.join(process.cwd(), './npm-shrinkwrap.json'), JSON.stringify(clean));
  fs.writeFile(path.join(process.cwd(), './npm-shrinkwrap.unsafe.json'), JSON.stringify(shrinkwrapped));
});
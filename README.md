# safe-shrinkwrap

Gives you a simple way to clean out OS specific dependencies from your shrinkwrap file. This makes it easy to create a cross platform shrinkwrap that doesn't break the world even if the maintainer of the systems doesn't.

## installation

`npm install -g safe-shrinkwrap`

This gives you `safe-shrinkwrap` and the shorter `ssw` for use on the command line.

## usage

All you have to use it is run `ssw` or `safe-shrinkwrap` from the root directory of your project. It will run `npm shrinkwrap --dev` and then clean up the resulting npm-shrinkwrap.json file. It leaves behind an `npm-shrinkwrap.unsafe.json` in addition to the cleaned up `npm-shrinkwrap.json` file. You should then be good to go.

If something goes wrong or you just want to be more aggressive then you can add the `-i` or `--install` flag to the command and it will blow away your node_modules directory, reinstall, and then create the shrinkwrap file for you.

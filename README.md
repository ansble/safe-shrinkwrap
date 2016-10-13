# safe-shrinkwrap

Gives you a simple way to clean out OS specific dependencies from your shrinkwrap file. This makes it easy to create a cross platform shrinkwrap that doesn't break the world even if the maintainer of the systems doesn't.

## installation

`npm install -g safe-shrinkwrap`

This gives you `safe-shrinkwrap` and the shorter `ssw` for use on the command line.

## usage

All you have to use it is run `ssw` or `safe-shrinkwrap` from the root directory of your project. It will run `npm shrinkwrap --dev` and then clean up the resulting npm-shrinkwrap.json file. It leaves behind an `npm-shrinkwrap.unsafe.json` in addition to the cleaned up `npm-shrinkwrap.json` file. You should then be good to go.

Be aware that it blows away your `node_modules` directory and reinstalls it. So if you had any extra modules that aren't in the `package.json`, or OS dependant modules, you will need to install them again  after this is done.

```
    -ni, --no-install : doesn't install
    -v, --version : outputs just the version
    -h, --help : outputs this help information
```

## No install version
IF... you really don't want to have it wipe and reinstall then you need to pass `--no-install` or `-ni`. This often leads to errors though. So be warned.

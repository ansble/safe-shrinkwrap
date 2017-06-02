const shouldInstall = (args) => {
        return args.indexOf('--no-install') < 0 && args.indexOf('-ni') < 0
      },
      shouldDedupe = (args) => {
        return args.indexOf('--no-dedupe') < 0 && args.indexOf('-ndd') < 0
      },
      shouldIncludeDev = (args) => {
        return args.indexOf('--no-dev') < 0 && args.indexOf('-nd') < 0
      },
      shouldRemoveShrinkwrap = (args) => {
        return args.indexOf('--remove-shrinkwrap') < 0 && args.indexOf('-rs') < 0
      };

module.exports = {
  shouldInstall: shouldInstall,
  shouldDedupe: shouldDedupe,
  shouldIncludeDev: shouldIncludeDev,
  shouldRemoveShrinkwrap: shouldRemoveShrinkwrap,

  build: (arguments) => {
    const args = arguments || [],
          commands = [];

    if (shouldInstall(args)) {
      commands.push('npm cache clear && npm install && ');
    }

    commands.push('npm prune && ');

    if (shouldDedupe(args)) {
      commands.push('npm dedupe && ')
    }

    commands.push('npm shrinkwrap');

    if (shouldIncludeDev(args)) {
      commands.push(' --dev')
    } else {
      commands.push(' --production')
    }

    return commands.join('');
  }
}
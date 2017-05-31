const mocha = require('mocha'),
      assert = require('chai').assert,
      command = require('./command');

describe('Command Module', () => {
  it ('should include install, dedupe and dev dependencies by default', () => {
    assert.strictEqual(command.build(), 'npm cache clear && npm install && npm prune && npm dedupe && npm shrinkwrap --dev');
  });

  it ('should not include install if --no-install or -ni', () => {
    assert.strictEqual(command.build(['--no-install']), 'npm prune && npm dedupe && npm shrinkwrap --dev');
    assert.strictEqual(command.build(['-ni']), 'npm prune && npm dedupe && npm shrinkwrap --dev');
  });

  it ('should not include dedupe if --no-dedupe or -ndd', () => {
    assert.strictEqual(command.build(['--no-dedupe']), 'npm cache clear && npm install && npm prune && npm shrinkwrap --dev');
    assert.strictEqual(command.build(['-ndd']), 'npm cache clear && npm install && npm prune && npm shrinkwrap --dev');
  });

  it ('should not include dedupe or install  if --no-dedupe and --ni or -ndd and --no-install', () => {
    assert.strictEqual(command.build(['--no-dedupe', '--no-install']), 'npm prune && npm shrinkwrap --dev');
    assert.strictEqual(command.build(['-ndd', '-ni']), 'npm prune && npm shrinkwrap --dev');
  });

  it ('should not include --dev if --no-dev and --nd', () => {
    assert.strictEqual(command.build(['--no-dev']), 'npm cache clear && npm install && npm prune && npm dedupe && npm shrinkwrap --production');
    assert.strictEqual(command.build(['-nd']), 'npm cache clear && npm install && npm prune && npm dedupe && npm shrinkwrap --production');
  });
});
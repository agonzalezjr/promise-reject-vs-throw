#!/usr/bin/env node

const chalk = require('chalk');
const timestamp = require('console-timestamp');

// Utils for logging ...

function log(msg, color) {
  if (!color) {
    color = chalk.white;
  }
  console.log('[hh:mm:ss] '.timestamp + color(msg));
}

const resolved  = (msg) => log('(Rs) ' + msg, chalk.green);
const rejected  = (msg) => log('(Rj) ' + msg, chalk.yellow);
const exception = (msg) => log('(Ex) ' + msg, chalk.bgRed);

// The tests ...

function NotAPromise() {
  return 'foo';
}

function AlwaysResolve() {
  return Promise.resolve(42);
}

function AlwaysReject() {
  return Promise.reject('could not complete');
}

function AlwaysThrow() {
  throw 'irrecoverable error';
}


resolved(NotAPromise());
rejected(NotAPromise());
exception(NotAPromise());

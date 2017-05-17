#!/usr/bin/env node

const chalk = require('chalk');
const timestamp = require('console-timestamp');

/*

Using reject vs throw with promises.

All docs: 
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

"If an error is thrown in the executor function, the promise is rejected. The return value of the executor is ignored."

Some subtleties ... (this is my favorite answer):
http://stackoverflow.com/questions/33445415/javascript-promises-reject-vs-throw

So conclusion: Both reject and throw will be caught inside the catch()
handler of the Promise. But always try to use reject()!

The other big difference is that when more code follows the either statement:
throw immediately completes the resolver function, while calling reject continues
execution normally - after having "marked" the promise as rejected.

All this is great, but:

"C is for code"
  -- cookie-monster

*/


// Some utils for logging ... move along ...

function log(msg, color) {
  if (!color) {
    color = chalk.white;
  }
  console.log('[hh:mm:ss] '.timestamp + color(msg));
}

const resolved  = (msg, indent) => log((indent ? indent : '') + '(Rs) ' + msg, chalk.green);
const rejected  = (msg, indent) => log((indent ? indent : '') + '(Rj) ' + msg, chalk.yellow);
const exception = (msg, indent) => log((indent ? indent : '') + '(Ex) ' + msg, chalk.bgRed);
const test = (msg) => {
  log(msg, chalk.magenta);
  return Promise.resolve();
};
// The tests ...

function NotAPromise() {
  return 'foo';
}

function AlwaysThrow() {
  throw 'irrecoverable error outside a promise'
}

function AlwaysResolveInPromise() {
  return Promise.resolve(42);
}

function AlwaysRejectInPromise() {
  return new Promise((resolve, reject) => {
    reject('could not complete');
    // code here *WILL* execute!
    // console.log('tada!');
  });
}

function AlwaysThrowInPromise() {
  // The catch of a try-catch outside of this will not get triggered 
  // if there is a catch() in the promise. Basically the reject() 
  // handler is used.
  return new Promise((resolve, reject) => {
    throw 'irrecoverable error inside a promise';
    // code here will never execute!
    // console.log('denied!');
  });
}

function PromiseTest(promise, indent) {
  if (typeof promise == 'function') {
    promise = promise();
  }
  try {
    return promise.then((resolvedTo) => {
      resolved('PromiseTest: ' + resolvedTo, indent);
      return resolvedTo;
    }).catch((rejectedBecause) => {
      // Adding this will *SWALLOW* the rejection, so
      // a Promise.all() will always resolve. Not good all the time.
      rejected('PromiseTest: ' + rejectedBecause, indent)
      return rejectedBecause
    });    
  } catch (errorThrown) {
    // No way to get this to run after the .catch() is added above !!
    exception('PromiseTest: ' + errorThrown, indent);
    throw errorThrown;
  }
}

function PromiseTestNoCatch(promise, indent) {
  try {
    return promise().then((resolvedTo) => {
      resolved('PromiseTestNoCatch: ' + resolvedTo, indent);
    });    
  } catch (errorThrown) {
    exception('PromiseTestNoCatch: ' + errorThrown, indent);
    throw errorThrown;
  }
}

function NotAPromiseTest(notPromise, indent) {
  try {
    let result = notPromise();
    resolved('NotAPromiseTest: ' + result, indent);
    return result;
  } catch (errorThrown) {
    exception('NotAPromiseTest: ' + errorThrown, indent);
  }
}

// Note that these are not guaranteed to run in order!


// test('launch separate').then(() => {
// PromiseTest(AlwaysResolveInPromise);
// PromiseTest(AlwaysRejectInPromise);
// PromiseTest(AlwaysThrowInPromise);
// });


// test('scalars').then(() => {
// NotAPromiseTest(NotAPromise);
// NotAPromiseTest(AlwaysThrow);
// });


// test('forgot to catch').then(() => {
// PromiseTestNoCatch(AlwaysResolveInPromise);
// // Again: the catch in try-catch is not used here. Error is:
// // UnhandledPromiseRejectionWarning: message
// // PromiseTestNoCatch(AlwaysRejectInPromise);
// // PromiseTestNoCatch(AlwaysThrowInPromise);
// });


// // resolve-then-reject-then-resolve
// test('sequential with reject in the middle').then(() => {
// PromiseTest(AlwaysResolveInPromise).then(() => {
//   PromiseTest(AlwaysRejectInPromise).then(() => {
//     PromiseTest(AlwaysResolveInPromise);
//   });
// });
// });


// // resolve-then-throw-then-resolve
// test('sequential with throw in the middle').then(() => {
// PromiseTest(AlwaysResolveInPromise).then(() => {
//   PromiseTest(AlwaysThrowInPromise).then(() => {
//     PromiseTest(AlwaysResolveInPromise);
//   });
// });
// });


// // all [resolve-reject-resolve-resolve]
// test('all with reject swallowed').then(() => {
// PromiseTest(Promise.all([PromiseTest(AlwaysResolveInPromise, '  '), 
//                          PromiseTest(AlwaysRejectInPromise, '  '),
//                          PromiseTest(AlwaysResolveInPromise, '  '),
//                          PromiseTest(AlwaysResolveInPromise, '  '),
//                         ]));
// });


// // all [resolve-throw-resolve-resolve]
// test('all with throw swallowed').then(() => {
// PromiseTest(Promise.all([PromiseTest(AlwaysResolveInPromise, '  '), 
//                          PromiseTest(AlwaysThrowInPromise, '  '),
//                          PromiseTest(AlwaysResolveInPromise, '  '),
//                          PromiseTest(AlwaysResolveInPromise, '  '),
//                         ]));
// });


// all [resolve-scalar-reject-resolve]
test('all swallowing a rejection').then(() => {
PromiseTest(Promise.all([PromiseTest(AlwaysResolveInPromise, '  '), 
                         NotAPromiseTest(NotAPromise, '  '),
                         PromiseTest(AlwaysRejectInPromise, '  '),
                         PromiseTest(AlwaysResolveInPromise, '  '),
                        ]));
});


// // all [resolve-reject-resolve-resolve] no swallow
// test('all without swallowing').then(() => {
// PromiseTest(Promise.all([PromiseTestNoCatch(AlwaysResolveInPromise, '  '), 
//                          PromiseTestNoCatch(AlwaysRejectInPromise, '  '),
//                          PromiseTestNoCatch(AlwaysResolveInPromise, '  '),
//                          PromiseTestNoCatch(AlwaysResolveInPromise, '  '),
//                         ]));
// });


// // race [resolve-throw-resolve-resolve]
// // They are all run, but only the first to complete returns
// test('race').then(() => {
// PromiseTest(Promise.race([PromiseTestNoCatch(AlwaysThrowInPromise, '  '),
//                           PromiseTestNoCatch(AlwaysResolveInPromise, '  '),
//                           PromiseTestNoCatch(AlwaysResolveInPromise, '  '),
//                         ]));
// });

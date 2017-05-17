## Using reject vs throw with promises.

All Promise docs:  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

> "If an error is thrown in the executor function, the promise is rejected. The return value of the executor is ignored."

Some subtleties ... (this is my favorite answer): http://stackoverflow.com/questions/33445415/javascript-promises-reject-vs-throw

**So conclusion: Both reject and throw will be caught inside the catch() handler of the Promise. But always try to use reject()!**

The other big difference is that when more code follows the either statement: throw immediately completes the resolver function, while calling reject continues execution normally - after having "marked" the promise as rejected.

All this is great, but:

> _"C is for code"_  -- cookie-monster

```sh
git clone https://github.wdf.sap.corp/I834123/promise-reject-vs-throw.git
cd promise-reject-vs-throw
npm i
node index.js
```
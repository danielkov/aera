## Version 1.1.3

  1. Changed error handling logic, so now error messages of all types will go through the same process as other response types, e.g.: passing in a stream as an error message will pipe that stream to the response object.

## Version 1.1.2

  1. Changed the routing logic a little bit. This means that now you have access to `request.query`, which is an object and search, a.k.a.: query parameters will no longer stop a route from working. This is more like a bugfix, rather than a release change, hence the minor version bump.
```js
.get('/', ({query}) => query) // localhost:3000/?something=value will respond with { "something": "value" }
```
  2. Added some more tests for serving files.

## Version 1.1.1 Release notes

Tiny update. Removed a `console.log()` that remained from development.

Implemented Travic CI for deployment and Coveralls for coverage reporting.

## Version 1.1.0 Release notes

With this version the instance methods have been reworked. New ones added: `head()`, `options()`, `patch()` to compliment the full arsenal of HTTP methods. HEAD requests will also be met with the headers of `GET` request should no `HEAD` request handler be provided.

Summary of changes:

  1. Added `head()`
  2. Added `patch()`
  3. Added `options()`
  4. Changed all methods to now also accept and Array as the first argument, which means:

```js
.get(['/', () => 'Hello']) // Is equal in functionality to
.get('/', () => 'Hello')
```

  5. Released [`aera-tools`](https://npmjs.com/package/aera-tools) to compliment Aera's API.

## Version 1.0.0 Release Notes

I am happy to announce the release of the **first major version**. This is the first major version, because I feel like Aera reached a point at which I would gladly recommend it to anyone wanting to get started with Node JS HTTP. Frankly, not a lot has changed since the previous version, however the API is now a lot more consistent with my expectations. For example, if you return errors, they will be handled properly (e.g.: their message will be displayed and their status, if they have any). The new version now also supports Duplex Streams, along with Readable Streams, which means you can build some very concise and insanely fast web applications, taking advantage of Transform Streams. To sum up the notes, here's a little summary:

  1. Fixed a tiny typo in the README

  2. Aera will now attempt to guess the mime type of your streams and send them over via the headers properly.

  3. The source files in the `/lib` folder are now more modular as I've split them up. This makes them easier to debug.

  4. More tests have been written to ensure Aera works as expected.

  5. Promises returned from handler functions will now get the same treatment as regular responses once they've been resolved (parsing and content type detection). This means you can now return a regular object as the return value of a Promise you passed into the handler function, like so:

```js
.get('/', () => new Promise((resolve, reject) => resolve({message: 'Hello'})))
```

**More info:** performance test are coming in the near future, but rest assured they will match all expectations. I have tested some basic examples with some of the more popular frameworks and with native Node JS and so far the results are awesome.

I will try not to bloat the API, like other frameworks do, instead I'm planning on releasing a bunch of tools you can use with Aera to make your web developing experience even more fun. These will come in the near future as `aera-tools` and will include stuff like easy authentication, database integration and more. Using these will stay completely optional, of course.

More documentation and guides are also coming your way!

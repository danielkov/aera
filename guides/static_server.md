# Creating a Static File Server with Aera

If you don't have `Aera` set up, make sure you follow the steps in [this guide](get_started.md) first! Once you're all set up let's move on to serving static content (files) with Aera!

```js
const Aera = require('aera')
const server = new Aera() // Port is 3000 by default.

server.get('/', () => 'Welcome to my static file server.')
.listen() // as of version 2.0
```

Above is the initial setup. Now let's make it send the users some static files!

For this, we'll use the built-in Node JS `fs` module, the documentation of which can be read [here](https://nodejs.org/api/fs.html).

Let's add `fs` to our project.

```js
const fs = require('fs')
```

We should also create a new directory, that we want to serve. We should avoid serving all files from our root directory.

Now let's take a look at the initial approach of many frameworks:

To extract the text content of a file, we can call `readFile()` of `fs`. If we don't want to mess with callbacks, we should use `fs.readFileSync()`, which will return the text contents of our file.

As all syncronous operations, this will block your program, until it receives some contents. This is no good, but we want to be assured that we have the files available.

We will also introduce path variables in our application.

```js
// Aera setup above
const { readFileSync } = require('fs')

server.get('/:file', ({params}) => readFileSync(`./our/folder/${params.file}`))
```

The above example will read the `file` parameter of the request and then call `fs` to help read the contents of the requested file into memory, after which it returns the content to the handler that will output it in our application.

However this is not the best we can do. In fact if we have larger files we want to server, we'll end up not being able to serve everyone and so some people will have to wait a long time for their files to arrive or will get a timeout.

The other approach is to read the files into memory at the beginning:

```js
// Aera and fs setup above
const indexHtml = readFileSync('./our/folder/index.html')
const mainJs = readFileSync('./our/folder/main.js')

server.get('/:file', ({params}) => {
  if (params.file === 'index.html') return indexHtml
  else if (params.file === 'main.js') return mainJs
  else return 'File not found.'
})
```

A little better now, but in this case, our system is holding all files at all times in its memory. In the above example it probably won't be a problem, however in larger applications, it is not ideal. Had we changed the contents of our files after startup, we'd need to restart the server too. No good.

Enter the world of Streams!

Streams are basically special objects that are optimal for handling larger chunks of data, since they handle them in chunks. You can read more on streams in the official Node JS documentations. What we need to know, is that Aera supports streams out of the box. This will come in handy.

```js
// Aera setup above
const { createReadStream } = require('fs')

server.get('/:file', ({params}) => createReadStream(`./our/folder/${params.file}`))
```

That's it! No, really. That is how easy it is to set up streaming file serving with Aera. But what about content types. As you may know, some browsers are so needy, that they can't figure out what type of file we're sending, just from its extension name (e.g.: .html). Luckily, Aera can! And it will do so, automatically. So if you've followed this guide and have a file named `index.html` in the folder you're pointing your server to, all you need to do is navigate to [localhost:3000/index.html](http://localhost:3000/index.html) to see the contents of your index.html being output into your browser. What's more is that you can inspect that the response will come with the header `Content-Type` set to `text/html`, which is exactly what we need!

If you want the content type to be something else, do not worry! Aera will not override your settings.

```js
server.get('/:file', ({params}, response) => {
  response.setHeader('Content-Type', 'text/x-my-content')
  return createReadStream(`./our/folder/${params.file}`)
})
```

If you've changed your code to the above and tried accessing the same URL again, you'd see that your file will now be served with your custom Content Type. Why you'd want that? I don't know, but rest assured, it can be done.

That's it! Now go create something amazing.

# Writing a RESTful API with Aera

If you don't have `Aera` set up, make sure you follow the steps in [this guide](get_started.md) first! Once you're all set up let's move on to writing a RESTful API with Aera!

```js
const Aera = require('aera')
const api = new Aera() // Default port will be 3000
```

If you don't know what REST (or RESTful) API's are, Google them... they're awesome. The main idea, is that instead of serving some HTML with your server, you instead send responses in the form of `json`, which can then be consumed by client-side JavaScript or another server. If you return objects (which are almost JSON) from your handlers in Aera, you'll see the responses in proper JSON format.

Let's create some dummy data that we can return from our API.

Node JS will read `.json` files and parse the contents automatically.

*pets.json*
```json
[
  {
    "name": "Dolly",
    "species": "sheep",
    "age": 12
  },
  {
    "name": "Fluffy",
    "species": "dog",
    "age": 4
  },
  {
    "name": "Doodle",
    "species": "ostrich",
    "age": 6
  }
]
```

Of course in a real-world application we'd use a database to store our data. Once you're comfortable with this guide, you can read up on using a database, like [MongoDB](https://www.mongodb.com/), which is perfect for these use-cases.

Now let's write some functions that return us some data, or better yet, let's make them return Promises, so that we can simulate the asyncronous nature of dealing with real databases:

At first we'll write a handler that returns all data:

```js
// Aera setup above
const db = require('./pets.json')

function getAll () {
  return new Promise((resolve, reject) => {
    resolve(db)
  })
}
```

Of course it's somewhat pointless to use a promise for this case, however in real databases you'll have to handle asyncronity in some way and promises are great for that.

Let's take a look at our handler then.

```js
// Aera and db setup above
api.get('/', () => getAll())
```

**As of version 2.0** we also need to call the `listen()` method!

```js
api.listen() // uses constructor's port is none provided (3000 in our case)
```

Because Aera handles promises out of the box, we are at luck here. There is nothing more we need to do to make our API return all pets.

Now let's take a look at getting information about a single pet.

Note, in our current implementation we're using the pets' position in the JSON Array as their index.

```js
// Aera and db setup above
function getById (index) {
  return new Promise((resolve, reject) => {
    if (db[index]) {
      return resolve(db[index])
    }
    else {
      return reject(new Error('No pets found with that id.'))
    }
  })
}
```

Superb, now let's write a handler that will return a pet by ID:

```js
// Aera and db setup above
api.get('/:id', ({params}) => getById(params.id))
```

Again, looks a bit too simple. Because in case we don't find any pets, our function returns a rejection with an error, Aera will treat this like any other error. It will show the user that their request returned no results, with your error message.

Let's now look at a way to create a new pet in our database:

First we write a function...

```js
// Rest of our app above
function createPet (pet) {
  return new Promise((resolve, reject) => {
    db.push(pet)
    return resolve(`Successfully added ${pet.name}`)
  })
}
```

We aren't checking if the provided pet parameter is correct for our use case. That will be your homework. ;)

Ideally if it weren't we could reject with an error.

Let's implement the route.

In this very simple example we'll be using the URL's query string to pass information to our server. A more advanced implementation with the request body will be available soon.

```js
// Awesomeness above
const qs = require('querystring')
const url = require('url')

api.get('/new', (req) => createPet(qs.parse(url.parse(req.url,true).query)))
```
We parse down the URL and find the query, then we parse the string to get an object, which we pass onto our `createPet()` function.

At this point you could also write a helper function to keep it cleaner in the handler. To see what we've done, let's visit [localhost:3000/new?name=Jerard&species=cat&age=42](http://localhost:3000/new?name=Jerard&species=cat&age=42)

We should see `Successfully added Jerard` and to confirm, we can take a look again at the index of our API that returns all pets. We should also see our new pet there.

There is still a lot you can do with this API, the possibilities are endless. Play around with it and have fun. once you restart your server the newly added pets will be gone. To keep hold of them you could implement a database.

That's it! Now go create something amazing.

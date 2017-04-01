# Get Started!

This guide here will teach you how to get started with HTTP and Node JS.

The contents are as follows:

  - [Install Node JS](#install-node-js)
  - [Create a new project](#create-a-new-project)
  - [Set up Aera](#set-up-aera)
  - [Hello world](#hello-world)


# Install Node JS

To install Node JS, follow the guide appropriate for your Operating System, [here.](https://nodejs.org/en/download/)

Once you're done downloading, make sure you also have `npm` installed. This should usually come with your Node JS installation.

Confirm versions in your terminal (command line):

```sh
node -v
# v7.8.0
npm -v
# 4.4.4
```

Note your version may be above the ones I put in the example.

# Create a new project

To initialize a new project, navigate to your desired project folder or make a new one with

```sh
mkdir myProject
```

and type in:

```sh
npm init
```

This will take you through the steps of creating a new npm project. You can skip this, by typing `npm init -y`, which will use all the defaults.

After this, you can now install modules using `npm`, with `npm install`.

# Set up Aera

To install Aera, type in your terminal in your project root folder:

```sh
# short for npm install --save aera
npm i -S aera
```

This will install Aera and add it to your project dependencies in your `package.json` file.

Now create a new file in your project root folder, called `index.js` or whatever entry point you provided.

# Hello World

To create a simple Hello, World! application with Aera, all you need to do is fill in your `index.js` with the following lines:

```js
const Aera = require('aera')
const server = new Aera()

server.get('/', () => 'Hello, World!')
```

Go ahead and run your application with:

```sh
node index
```

Now open your browser and navigate to [http://localhost:3000](http://localhost:3000)! You should see **Hello, World!** being output.

To change the text you see in your browser, you can change it on the handler function and refresh your application by terminating it first (usually ctrl + c) and then starting it again, with:

```sh
node index
```

That's it! Now go create something amazing.

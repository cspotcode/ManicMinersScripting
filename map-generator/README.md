To develop the map generator locally:

```
# install dependencies using `npm`.  You'll need to have node and npm installed; this is beyond the scope of this readme
npm install
../node_modules/.bin/webpack-dev-server
# Watch the terminal for compile errors.
# Open localhost:8080 in your browser.
```

To build the map generator:

```
../node_modules/.bin/webpack
# The map generator is only 2 files: index.html and browser.js
```
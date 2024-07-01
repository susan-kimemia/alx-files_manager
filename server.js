// server.js file
// Inside server.js, create the Express server:
// it should listen on the port set by the environment variable PORT or by default 5000
// it should load all routes from the file routes/index.js
const express = require('express');
const routes = require('./routes/index');

const server = express();
const PORT = process.env.PORT || 5000;

// it should load all routes from the file routes/index.js
server.use(express.json());// Middleware for parsing JSON bodies
server.use(routes);

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

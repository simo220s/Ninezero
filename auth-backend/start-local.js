// Load environment variables before anything else
require('dotenv').config({ path: __dirname + '/.env' });

// Now start the server
require('./dist/server.js');

const dotenv = require('dotenv');
const path = require('path');

// Set ENV variables before exec app.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('./app');

// Server.
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listen on port: ', port));

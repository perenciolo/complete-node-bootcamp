const app = require('./app');

// Server.
const port = 3001;
app.listen(port, () => console.log('Listen on port: ', port));

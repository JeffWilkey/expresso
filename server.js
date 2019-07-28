const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const app = express();
const PORT = process.env.PORT || 4000;
const apiRouter = require('./api/api');

// Middleware
app.use(morgan('dev'));
app.use(cors());

// Routing
app.use('/api', apiRouter);

// Error Handling
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler())
}

// Run server
app.listen(PORT, () => {
  console.log(`App listening on: ${PORT}`);
});

module.exports = app;
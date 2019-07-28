const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(morgan('dev'));
app.use(cors());

// Routing


// Run server
app.listen(PORT, () => {
  console.log(`App listening on: ${PORT}`);
});

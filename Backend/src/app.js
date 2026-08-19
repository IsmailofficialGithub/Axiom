const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorConverter, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());

// HTTP request logger
app.use(morgan('dev'));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// v1 api routes (To be mounted later)
// app.use('/api/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  const ApiError = require('./utils/ApiError');
  next(new ApiError(404, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;

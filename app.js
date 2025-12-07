const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const globalErrorHandler = require('./controllers/errorController');
// const authController = require('./controllers/authController');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const subsRoute = require('./routes/subsRoute');
const categoryRoute = require('./routes/categoryRoute');

app.use(morgan('dev'));

// app.use((req, res, next) => {
//   console.log(req.method);
//   next();
// });

app.use(
  cors({
    origin: ['http://localhost:8080', 'https://trackizer-frontend.vercel.app'],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/health', (req, res)=> {
  res.status(200).end()
})


app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/subscriptions', subsRoute);
app.use('/api/v1/categories', categoryRoute);


app.use(globalErrorHandler);

module.exports = app;


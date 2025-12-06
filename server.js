require('dotenv').config()
const mongoose = require('mongoose')

const app = require('./app')

 const connectDB = async function () {
  try {
    if (!process.env.URI) throw new Error('invalid mongo uri');
    await mongoose.connect(process.env.URI);
    console.log('connected to db')
  } catch (error) {
    console.error('ERROR💥: ', error);
    process.exit(1);
  }
 }

const initServer = async function () {
  try {
    //connect to db
    await connectDB();

    //start server
    const server = app.listen(process.env.PORT, '0.0.0.0', () => {
      console.log(`server started at port: ${process.env.PORT}`);
    });

    //close server on async error
    process.on('unhandledRejection', (error) => {
      console.error('UNHANDLED REJECTION!', error);
      server.on('close', () => process.exit(1));
    });
  } catch (error) {
    console.log('server startup failed');
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION!', error);
  process.exit(1);
});

initServer();

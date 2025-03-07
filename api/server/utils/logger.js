// const { createLogger, transports,format } = require('winston');

// const { combine, timestamp, printf } = format;

// const logFormat = printf(({ level, message, timestamp }) => {
//   return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
// });

// // const app = require('../../server/server.js');

// const logger = createLogger({
//   transports: [
//     new transports.Console(),
//     new transports.File({ filename: `./logs/error-${new Date().toISOString().slice(0,10)}.log`,
//       level: 'error',
//       // format: combine(
//       //   timestamp(),
//       //   logFormat
//       // ),
//       handleExceptions: true,
//       humanReadableUnhandledException: true,
//       json: true,
//       maxsize: 5242880, // 5MB
//       maxFiles: 5,
//       colorize: false,
//       datePattern: 'YYYY-MM-DD' })
//   ],
//   exitOnError: false
// },
// {
//   transports: [
//     new transports.Console(),
//     new transports.File({ filename: `./logs/app-${new Date().toISOString().slice(0,10)}.log`,
//       level: 'info',
//       json: true,
//       maxsize: 5242880, // 5MB
//       maxFiles: 5,
//       colorize: false,
//       datePattern: 'YYYY-MM-DD' })
//   ],
//   exitOnError: false
// });


// logger.exceptions.handle(new transports.File({ filename: `./logs/unhandled-${new Date().toISOString().slice(0,10)}.log`,
//       datePattern: 'YYYY-MM-DD' }));


// // var app = require('../../server/server');

// // const app = loopback();

// // Get all the models in the application
// // const models = app.models();
// // 
//   console.log("models");
// // // Create a change stream for each model
// // for (const modelName in models) {
// //   console.log(modelName);
// //   const model = models[modelName];

// //   // Create a change stream for the model
// //   const changeStream = model.createChangeStream({ includeOldValue: true });

// //     console.log("changeStream **** ");
// //   // Listen for changes to the model and log them
// //   changeStream.on('data', (change) => {
// //     console.log("changeStream change ",change);
// //     logger.info(`Change to ${change.modelName} with ID ${change.id}: ${JSON.stringify(change.data)} (old value: ${JSON.stringify(change.previousData)})`);
// //   });

// //   // Handle errors from the change stream
// //   changeStream.on('error', (err) => {
// //     console.log("changeStream error ",err);
// //     logger.error(`Error in change stream for ${modelName}: ${err.message}`);
// //   });

// //   // Start the change stream
// //   changeStream.start();
// // }

// // function doSomething() {
// //   // simulate an error
// //   throw new Error('Something went wrong');
// // }

// // process.on('unhandledRejection', (err) => {
// //   logger.error('Unhandled Promise rejection', { error: err });
// // });

// // Simulate an unhandled error
// // setTimeout(() => {
// //   throw new Error('Unhandled error');
// // }, 1000);

// // logger.handleExceptions(new transports.File({ filename: './logs/unhandled.log' }));

// // const winston = require('winston');
// // console.log("ffgd");
// // const logger = new winston.Logger({
// //   transports: [
// //     new winston.transports.File({
// //       level: 'error',
// //       filename: './logs/error.log',
// //       handleExceptions: true,
// //       humanReadableUnhandledException: true,
// //       json: true,
// //       maxsize: 5242880, // 5MB
// //       maxFiles: 5,
// //       colorize: false
// //     })
// //   ],
// //   exitOnError: false
// // });

// module.exports = logger;
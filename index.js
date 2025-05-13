const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimiter = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path')
// const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const passport = require('passport');

require('dotenv').config();
require('./utils/passport');
require('express-async-errors');

const userRouter = require('./Routes/usersRoutes');
const postRouter = require('./Routes/postsRoutes');
const authRouter = require('./Routes/authRoutes');
const likeRouter = require('./Routes/likesRoutes');

const logger = require('./utils/logger');
const AppError = require('./utils/AppError');
const globalErrorMiddleware = require('./Middlewares/globalErrorMiddleware');

const app = express();

process.on('uncaughtException', function (err) {
  logger.error('Uncaught exception', err);
  logger.error(err.name, err.message);
  process.exit(1);
});
app.use(helmet());

app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173' || 'https://clone-x-khaki.vercel.app'], 
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));


app.use(mongoSanitize());
app.use(xss());

app.use(passport.initialize());

const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/', limiter);

// app.use(hpp());

app.get('/', (req, res) => {
  res.send('Hello From Another World');
});

app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/api/auth', authRouter);
app.use('/likes', likeRouter);

app.all('/*', (req, res, next) => {
  throw new AppError(
    `Error : Can't find ${req.originalUrl} on this server!`,
    404
  );
});

app.use(globalErrorMiddleware);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    logger.info('Connected With MongoDB Server');
    app.listen(process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    logger.info(`Faild to connect with MongoDB`, err);
  });

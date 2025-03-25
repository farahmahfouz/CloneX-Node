const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
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

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.use(passport.initialize());

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

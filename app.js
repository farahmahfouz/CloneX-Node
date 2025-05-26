const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimiter = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/AppError');
const globalErrorMiddleware = require('./Middlewares/globalErrorMiddleware');


const userRouter = require('./Routes/usersRoutes');
const postRouter = require('./Routes/postsRoutes');
const authRouter = require('./Routes/authRoutes');
const likeRouter = require('./Routes/likesRoutes');
const commentRouter = require('./Routes/commentsRoutes');
const notificationRouter = require('./Routes/notificationRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://clone-x-khaki.vercel.app'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/', limiter);

app.use(hpp());

app.use(compression());

app.get('/', (req, res) => {
  res.send('Hello From Another World');
});

app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/api/auth', authRouter);
app.use('/likes', likeRouter);
app.use('/comments', commentRouter);
app.use('/notifications', notificationRouter);

app.all('/*', (req, res, next) => {
  next(new AppError(`Error: Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorMiddleware);

module.exports = app;

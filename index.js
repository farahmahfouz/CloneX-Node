require('dotenv').config();
require('express-async-errors');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const app = require('./app');
const { verifyToken } = require('./utils/jwt');

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://clone-x-khaki.vercel.app'],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    const decoded = await verifyToken(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.userId}`);
  socket.join(socket.userId);

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.userId}`);
  });
});

app.set('io', io);

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
  process.exit(1);
});

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    logger.info('Connected With MongoDB Server');
    httpServer.listen(process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to connect with MongoDB', err);
  });

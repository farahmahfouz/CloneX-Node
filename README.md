# X Backend Server

A robust Express.js backend server for the X social media platform, handling authentication, posts, likes, and image uploads.

## 🚀 Features

- **Authentication System**
  - JWT-based authentication
  - Google OAuth integration
  - Password reset functionality
  - Session management
  - Token refresh mechanism

- **Posts Management**
  - CRUD operations for posts
  - Multiple image upload support (up to 3 images)
  - Like/unlike functionality
  - User-specific post retrieval

- **User Management**
  - Profile updates
  - Password management
  - Image upload for profile pictures
  - User settings

## 🛠️ Tech Stack

- Express.js
- JWT Authentication
- Passport.js for OAuth
- MongoDB (Database)
- Joi for input validation
- Multer for image handling

## 📦 Installation

1. Navigate to the server directory:
```bash
cd server2
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGODB_URI=your_mongodb_connection_string
```

4. Start the development server:
```bash
npm start
```

## 📁 Project Structure

```
server2/
├── Controllers/           # Route controllers
│   ├── authController.js  # Authentication logic
│   ├── postsController.js # Posts management
│   ├── usersController.js # User management
│   └── likesController.js # Likes functionality
├── Middlewares/          # Custom middlewares
│   └── authMiddleware.js # Authentication middleware
├── Routes/              # API routes
│   ├── authRoutes.js    # Authentication routes
│   ├── postsRoutes.js   # Posts routes
│   ├── usersRoutes.js   # User routes
│   └── likesRoutes.js   # Likes routes
├── utils/              # Utility functions
│   └── images.js       # Image handling utilities
└── validation/         # Input validation schemas
    ├── userValidation.js
    └── postValidation.js
```

## 🔄 API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh authentication token
- `POST /api/auth/forgotPassword` - Request password reset
- `PATCH /api/auth/resetPassword/:token` - Reset password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### User Routes
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/updateMe` - Update user profile
- `PATCH /api/users/updateMyPassword` - Update password

### Post Routes
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/me` - Get user's posts

### Like Routes
- `GET /api/posts/:postId/likes` - Get post likes
- `POST /api/posts/:postId/likes` - Add like
- `DELETE /api/posts/:postId/likes` - Remove like

## 🔒 Security Features

- JWT-based authentication
- Password hashing
- Input validation
- Protected routes
- Secure cookie handling
- OAuth 2.0 implementation

## 🎯 Future Enhancements

1. **Performance Optimization**
   - Add rate limiting
   - Optimize database queries
   - Add request compression

2. **Additional Features**
   - Comments system
   - User following/followers
   - Direct messaging
   - Real-time notifications
   - Comments

3. **Security Improvements**
   - Add request validation
   - Implement API key management
   - Add request logging
   - Enhance error handling

4. **Monitoring & Analytics**
   - Add logging system
   - Implement performance monitoring
   - Add user analytics
   - Track API usage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License. 
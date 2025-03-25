const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Models/usersModel');
const bcrypt = require('bcrypt');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_BACK_URL,
      scope: ['profile', 'email'],
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const hashedPassword = await bcrypt.hash(
            Math.random().toString(36).slice(-8),
            10
          );
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            password: hashedPassword,
            dateOfBirth: new Date(),
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    if (!id) throw new Error('User ID is missing');
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

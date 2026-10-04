import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
)
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error('Google did not provide an email address.'));
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
          if (!user)
            user = await User.create({
              name: profile.displayName || 'Customer',
              email,
              googleId: profile.id,
              isEmailVerified: true,
              role: 'customer',
            });
          else if (!user.googleId) {
            user.googleId = profile.id;
            user.isEmailVerified = true;
            await user.save();
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
export default passport;

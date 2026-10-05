import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { env } from './env.js';

if (env.google.configured)
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error('Google did not provide an email address.'));
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
          if (user && user.role !== 'customer')
            return done(new Error('Google sign-in is available for customer accounts only.'));
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

import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { User } from '@/models/User.model';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    
    // Manual Email/Password Provider
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        try {
          await mongoose.connect(process.env.MONGODB_URI || '');
          
          const user = await User.findOne({ email: credentials.email });

          if (!user || !user.passwordHash) {
            throw new Error('No user found with this email');
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!passwordMatch) {
            throw new Error('Incorrect password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.firstName || user.username || 'User',
            image: user.googleImage,
          };
        } catch (error) {
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google' && profile) {
        try {
          await mongoose.connect(process.env.MONGODB_URI || '');

          let dbUser = await User.findOne({ googleId: profile.sub });

          if (!dbUser) {
            // Check if user with this email already exists
            const existingUser = await User.findOne({ email: profile.email });
            
            if (existingUser) {
              // Link Google to existing account
              dbUser = await User.findByIdAndUpdate(
                existingUser._id,
                {
                  googleId: profile.sub,
                  googleEmail: profile.email,
                  googleName: profile.name,
                  googleImage: profile.image,
                  emailVerified: profile.email_verified || existingUser.emailVerified,
                  oauthProvider: 'google',
                },
                { new: true }
              );
            } else {
              // Create new user from Google
              const names = profile.name?.split(' ') || [''];
              dbUser = await User.create({
                email: profile.email,
                googleId: profile.sub,
                googleEmail: profile.email,
                googleName: profile.name,
                googleImage: profile.image,
                firstName: names[0] || undefined,
                lastName: names.slice(1).join(' ') || undefined,
                emailVerified: profile.email_verified || false,
                oauthProvider: 'google',
              });
            }
          } else {
            // Update existing Google user
            await User.findByIdAndUpdate(dbUser._id, {
              googleEmail: profile.email,
              googleName: profile.name,
              googleImage: profile.image,
              emailVerified: profile.email_verified || dbUser.emailVerified,
            });
          }

          // Store user ID in the JWT
          user.id = dbUser._id.toString();
          return true;
        } catch (error) {
          console.error('SignIn callback error:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      if (account?.provider === 'google') {
        token.provider = 'google';
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
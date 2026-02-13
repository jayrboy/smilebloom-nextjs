import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';
import { decode as defaultDecode, encode as defaultEncode } from 'next-auth/jwt';

import { connectMongoDB } from '@/src/lib/mongodb';
import User from '@/src/models/user';

const ONE_DAY_SECONDS = 60 * 60 * 24; // 1 day
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember', type: 'text' },
      },
      async authorize(credentials) {
        const username = credentials?.username;
        const password = credentials?.password;
        const rememberRaw = credentials?.remember;
        const remember =
          rememberRaw === 'true' || rememberRaw === 'on' || rememberRaw === '1';

        if (!username || !password) return null;

        try {
          await connectMongoDB();
          const user = await User.findOne({ username });

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) return null;

          return {
            id: user._id.toString(),
            username: user.username,
            role: user.role,
            remember,
          };
        } catch (error) {
          console.log('Error in authorize: ', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // Cookie/session maxAge should be the longest we support; the JWT exp will be shorter when remember=false.
    maxAge: THIRTY_DAYS_SECONDS,
  },
  jwt: {
    async encode(params) {
      const token = params.token as (typeof params.token & { remember?: boolean }) | null;
      const remember = token?.remember === true;
      const maxAge = remember ? THIRTY_DAYS_SECONDS : ONE_DAY_SECONDS;
      return defaultEncode({ ...params, maxAge });
    },
    async decode(params) {
      return defaultDecode(params);
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.remember = (user).remember === true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id || '';
        session.user.username = token.username || '';
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login',
  },
};


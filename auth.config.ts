import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Kakao from 'next-auth/providers/kakao';
import type { NextAuthConfig } from 'next-auth';

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Kakao({
      clientId: process.env.AUTH_KAKAO_ID,
      clientSecret: process.env.AUTH_KAKAO_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
      }
      if (trigger === 'update') {
        // Force refresh from DB on next session access
        token.refreshProfile = true;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      if (token.name) session.user.name = token.name as string;
      if (token.picture) session.user.image = token.picture as string;
      return session;
    },
  },
} satisfies NextAuthConfig;

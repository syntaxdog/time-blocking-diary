import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import authConfig from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
      }
      // When session update is triggered, refresh profile from DB
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { name: true, image: true },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      return token;
    },
  },
});

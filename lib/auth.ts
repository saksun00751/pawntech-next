import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8 hours
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        const user = await prisma.users.findUnique({
          where: { username: credentials.username },
        })
        if (!user || !user.active) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        await prisma.users.update({
          where: { id: user.id },
          data: { last_login: new Date() },
        })
        return { id: String(user.id), name: user.name, email: user.username, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).id = token.userId
        ;(session.user as any).username = token.email
      }
      return session
    },
  },
}

export type SessionUser = {
  id: string
  name: string
  username: string
  role: 'admin' | 'staff'
}

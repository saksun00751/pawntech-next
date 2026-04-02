import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/devices/:path*',
    '/lock/:path*',
    '/redeem/:path*',
    '/report/:path*',
    '/users/:path*',
    '/settings/:path*',
  ],
}

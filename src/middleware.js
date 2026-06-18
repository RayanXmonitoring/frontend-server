import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes protection
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Reseller routes protection
    if (path.startsWith('/reseller') && token?.role !== 'reseller' && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/devices/:path*',
    '/gallery/:path*',
    '/sms/:path*',
    '/monitoring/:path*',
    '/admin/:path*',
    '/reseller/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email dan password wajib diisi');
          }

          // Sign in with Firebase
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          if (!userCredential.user) {
            throw new Error('Login gagal');
          }

          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          
          if (!userDoc.exists()) {
            throw new Error('Data user tidak ditemukan');
          }

          const userData = userDoc.data();

          // Check if user is suspended
          if (userData.isSuspended) {
            throw new Error('Akun Anda telah ditangguhkan');
          }

          // Return user object
          return {
            id: userCredential.user.uid,
            email: userCredential.user.email,
            name: userData.displayName || userCredential.user.displayName || 'User',
            role: userData.role || 'user',
            ...userData
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Login gagal');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.userData = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.uid = token.uid;
        session.user.role = token.role;
        session.user.userData = token.userData;
      }
      return session;
    }
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
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };

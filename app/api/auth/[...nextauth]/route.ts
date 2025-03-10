import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

// Define a type for the Axios error response
type StrapiErrorResponse = {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
};

// Define auth options outside the export
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`,
            {
              identifier: credentials?.email,
              password: credentials?.password,
            }
          );
          if (res.data && res.data.jwt) {
            return {
              id: res.data.user.id,
              name: res.data.user.username,
              email: res.data.user.email,
              jwt: res.data.jwt,
            };
          }
          throw new Error("Invalid credentials");
        } catch (error: unknown) {
          let errorMsg = "Authentication failed";
          
          if (typeof error === 'object' && error !== null && 'response' in error) {
            const strapiError = error as StrapiErrorResponse;
            if (strapiError.response?.data?.error?.message) {
              errorMsg = strapiError.response.data.error.message;
            }
          } else if (error instanceof Error) {
            errorMsg = error.message;
          }
          
          throw new Error(errorMsg);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.jwt = user.jwt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.jwt = token.jwt as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Create the handler using the authOptions
const handler = NextAuth(authOptions);

// Export the handler as GET and POST - these are the only valid exports for route handlers
export { handler as GET, handler as POST };
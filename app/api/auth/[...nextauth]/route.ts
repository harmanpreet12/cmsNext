
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
          const res = await axios.post(`${strapiUrl}/api/auth/local`, {
            identifier: credentials.email,
            password: credentials.password,
          });

          if (res.data?.jwt && res.data?.user) {
            return {
              id: res.data.user.id,
              email: res.data.user.email,
              name: res.data.user.username,
              jwt: res.data.jwt,
            };
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          throw new Error("Invalid credentials");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
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
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
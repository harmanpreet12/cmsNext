import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    jwt: string;
  }

  interface Session {
    user: {
      id: string;
      jwt: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}
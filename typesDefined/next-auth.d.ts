import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface Profile {
    given_name?: string;
    family_name?: string;
    email_verified?: boolean;
  }
}
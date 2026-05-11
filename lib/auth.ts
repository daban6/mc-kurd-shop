import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";
import { ac, superAdmin, contentAdmin, paymentAdmin } from "./permissions";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.DATABASE_URL }),
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      ac,
      roles: { superAdmin, contentAdmin, paymentAdmin },
      adminRoles: ["superAdmin", "contentAdmin", "paymentAdmin"],
    }),
    nextCookies(),
  ],
});

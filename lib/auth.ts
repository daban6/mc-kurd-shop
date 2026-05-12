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
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      void resend.emails.send({
        from: "MC Kurd Shop <noreply@eclipticforce.store>",
        to: user.email,
        subject: "Verify your email address",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
            <h2 style="color:#7c3aed">MC Kurd Shop</h2>
            <p>Click the button below to verify your email address.</p>
            <a href="${url}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Verify Email</a>
            <p style="color:#71717a;font-size:12px;margin-top:24px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
          </div>
        `,
      });
    },
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

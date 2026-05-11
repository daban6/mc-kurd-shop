import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, superAdmin, contentAdmin, paymentAdmin } from "./permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    adminClient({
      ac,
      roles: { superAdmin, contentAdmin, paymentAdmin },
    }),
  ],
});

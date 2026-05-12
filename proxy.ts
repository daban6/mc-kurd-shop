import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Exclude _next internals, api/auth (BetterAuth), and any path with a file extension (static files)
    "/((?!api|_next|.*\\..*).*)",
    "/",
  ],
};

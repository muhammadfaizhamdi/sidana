import { withAuth } from "next-auth/middleware";

export default function proxy(req) {
  return withAuth({
    pages: {
      signIn: "/login",
    },
  })(req);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/transactions/:path*",
    "/api/goals/:path*"
  ],
};
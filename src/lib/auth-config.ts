import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true, // 信任所有主机（开发和生产环境）
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl, headers } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedRoute =
        nextUrl.pathname.startsWith("/notes") ||
        nextUrl.pathname.startsWith("/api/notes") ||
        nextUrl.pathname.startsWith("/api/user");

      if (isOnProtectedRoute) {
        if (isLoggedIn) return true;

        // 修复 callbackUrl：使用请求头中的实际主机名
        // 优先使用 X-Forwarded-Host（nginx 反向代理），否则使用 Host
        const host = headers.get("x-forwarded-host") || headers.get("host");
        const protocol =
          headers.get("x-forwarded-proto") || (nextUrl.protocol === "https:" ? "https" : "http");

        // 如果检测到生产域名（非 localhost），手动构建正确的 callbackUrl
        if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
          // 构建完整的 callbackUrl，使用实际的生产域名
          const callbackUrl = new URL(nextUrl.pathname + nextUrl.search, `${protocol}://${host}`);
          const loginUrl = new URL("/login", `${protocol}://${host}`);
          loginUrl.searchParams.set("callbackUrl", callbackUrl.toString());

          // 返回自定义重定向，确保使用正确的域名
          return Response.redirect(loginUrl);
        }

        return false; // 重定向到登录页（开发环境或 localhost）
      }

      return true;
    },
  },
  providers: [], // 在 middleware 中不需要 providers
} satisfies NextAuthConfig;

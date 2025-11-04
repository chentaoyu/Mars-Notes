import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true, // 信任所有主机（开发和生产环境）
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedRoute = 
        nextUrl.pathname.startsWith('/notes') || 
        nextUrl.pathname.startsWith('/editor') ||
        nextUrl.pathname.startsWith('/api/notes') ||
        nextUrl.pathname.startsWith('/api/user');
      
      if (isOnProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // 重定向到登录页
      }
      
      return true;
    },
  },
  providers: [], // 在 middleware 中不需要 providers
} satisfies NextAuthConfig;


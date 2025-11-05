import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // 信任所有主机（开发和生产环境）
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email", placeholder: "your@email.com" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error("邮箱或密码错误");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isPasswordValid) {
          throw new Error("邮箱或密码错误");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // 首次登录时设置用户信息
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // 调试：记录所有 jwt callback 调用
      if (process.env.NODE_ENV === "development") {
        console.log(
          "JWT callback called - trigger:",
          trigger,
          "token.id:",
          token.id,
          "token.name:",
          token.name
        );
      }

      // 当调用 update() 时，从数据库重新获取最新的用户信息
      // 在 NextAuth v5 中，trigger 应该是 "update"
      if (trigger === "update") {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "JWT callback triggered with update, trigger:",
            trigger,
            "token.id:",
            token.id
          );
        }
        if (token.id) {
          try {
            const updatedUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
              },
            });
            if (updatedUser) {
              if (process.env.NODE_ENV === "development") {
                console.log("Updated user from database:", updatedUser);
                console.log("Old token.name:", token.name, "New token.name:", updatedUser.name);
              }
              token.id = updatedUser.id;
              token.email = updatedUser.email;
              token.name = updatedUser.name;
              token.picture = updatedUser.image;
            } else {
              if (process.env.NODE_ENV === "development") {
                console.log("User not found in database, token.id:", token.id);
              }
            }
          } catch (error) {
            console.error("Error fetching updated user:", error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;

        if (process.env.NODE_ENV === "development") {
          console.log(
            "Session callback - token.name:",
            token.name,
            "session.user.name:",
            session.user.name
          );
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

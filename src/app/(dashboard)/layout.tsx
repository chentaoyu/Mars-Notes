"use client";

import { SessionProvider } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 min-h-0">{children}</main>
        <Footer />
      </div>
    </SessionProvider>
  );
}

"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        <Link href="/notes" className="flex items-center space-x-2">
          <h1 className="text-lg sm:text-2xl font-bold">Mars-Notes</h1>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden md:flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{session?.user?.name || "用户"}</span>
          </div>
          <Link href="/profile">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              title="我的页面"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            title="退出登录"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut, User } from "lucide-react";

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleNewNote = async () => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "未命名笔记",
          content: "",
        }),
      });

      if (response.ok) {
        const note = await response.json();
        router.push(`/editor/${note.id}`);
      }
    } catch (error) {
      console.error("创建笔记失败:", error);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/notes" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">云笔记</h1>
        </Link>

        <div className="flex items-center gap-2">
          <Button onClick={handleNewNote} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            新建笔记
          </Button>

          <div className="flex items-center gap-2 ml-4 pl-4 border-l">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{session?.user?.name || "用户"}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}


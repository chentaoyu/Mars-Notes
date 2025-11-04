import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Mars-Notes</h1>
          <p className="mt-2 text-muted-foreground">简洁、高效的在线笔记</p>
        </div>
        {children}
      </div>
    </div>
  );
}


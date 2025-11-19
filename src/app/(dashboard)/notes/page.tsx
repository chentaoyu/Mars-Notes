import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NotesPageClient } from "@/components/notes/NotesPageClient";

// 标记为动态渲染，因为使用了 auth() 需要访问 headers
export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <NotesPageClient />;
}


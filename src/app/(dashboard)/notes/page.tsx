import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NotesPageClient } from "@/components/notes/NotesPageClient";

export default async function NotesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <NotesPageClient />;
}


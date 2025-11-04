import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoteList } from "@/components/notes/NoteList";

export default async function NotesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">我的笔记</h2>
        <p className="text-muted-foreground mt-2">共 {notes.length} 篇笔记</p>
      </div>
      <NoteList notes={notes} />
    </div>
  );
}


import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";

interface EditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditorPage(props: EditorPageProps) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const note = await prisma.note.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      notebook: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
      noteTags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!note) {
    redirect("/notes");
  }

  // 转换 noteTags 为 tags
  const tags = note.noteTags.map((nt) => nt.tag);

  return (
    <MarkdownEditor
      noteId={note.id}
      initialTitle={note.title}
      initialContent={note.content}
      initialNotebookId={note.notebookId || undefined}
      initialTags={tags}
    />
  );
}


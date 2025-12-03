import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/ai/sessions/[id]/export-note - 将聊天会话导出为笔记
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: sessionId } = await params;

    // 获取聊天会话
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    if (chatSession.messages.length === 0) {
      return NextResponse.json(
        { error: "No messages to export" },
        { status: 400 }
      );
    }

    // 格式化消息为 Markdown
    let noteContent = `# ${chatSession.title}\n\n`;
    noteContent += `> 从 AI 对话生成 - ${new Date().toLocaleString("zh-CN")}\n\n`;
    noteContent += "---\n\n";

    chatSession.messages.forEach((message) => {
      if (message.role === "user") {
        noteContent += `## 👤 用户\n\n${message.content}\n\n`;
      } else if (message.role === "assistant") {
        noteContent += `## 🤖 AI 助手\n\n${message.content}\n\n`;
      }
      noteContent += "---\n\n";
    });

    // 创建笔记
    const note = await prisma.note.create({
      data: {
        title: chatSession.title,
        content: noteContent,
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

    // 转换数据格式
    const formattedNote = {
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
      noteTags: undefined,
    };

    return NextResponse.json({
      data: formattedNote,
      message: "笔记创建成功",
    });
  } catch (error) {
    console.error("导出笔记失败:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


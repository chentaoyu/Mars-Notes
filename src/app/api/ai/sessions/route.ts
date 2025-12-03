import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 获取聊天会话列表
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("获取聊天会话失败:", error);
    return NextResponse.json({ error: "获取会话失败" }, { status: 500 });
  }
}

// 创建新的聊天会话
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    const chatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        title: title || "新对话",
      },
    });

    return NextResponse.json({
      success: true,
      data: chatSession,
    });
  } catch (error) {
    console.error("创建聊天会话失败:", error);
    return NextResponse.json({ error: "创建会话失败" }, { status: 500 });
  }
}


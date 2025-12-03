import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 获取单个会话详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: chatSession,
    });
  } catch (error) {
    console.error("获取会话详情失败:", error);
    return NextResponse.json({ error: "获取会话失败" }, { status: 500 });
  }
}

// 更新会话标题
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    const chatSession = await prisma.chatSession.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: { title },
    });

    return NextResponse.json({
      success: true,
      data: chatSession,
    });
  } catch (error) {
    console.error("更新会话失败:", error);
    return NextResponse.json({ error: "更新会话失败" }, { status: 500 });
  }
}

// 删除会话
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.chatSession.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "会话已删除",
    });
  } catch (error) {
    console.error("删除会话失败:", error);
    return NextResponse.json({ error: "删除会话失败" }, { status: 500 });
  }
}


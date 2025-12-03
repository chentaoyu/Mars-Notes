import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 获取 AI 配置
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const config = await prisma.aIConfig.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        provider: true,
        model: true,
        apiKey: true, // 注意：实际应用中应该加密存储
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("获取 AI 配置失败:", error);
    return NextResponse.json({ error: "获取配置失败" }, { status: 500 });
  }
}

// 更新或创建 AI 配置
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { provider, apiKey, model } = body;

    if (!apiKey || !model) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const config = await prisma.aIConfig.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        provider: provider || "deepseek",
        apiKey,
        model,
      },
      update: {
        provider: provider || "deepseek",
        apiKey,
        model,
      },
    });

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("更新 AI 配置失败:", error);
    return NextResponse.json({ error: "更新配置失败" }, { status: 500 });
  }
}

// 删除 AI 配置
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    await prisma.aIConfig.delete({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: "配置已删除",
    });
  } catch (error) {
    console.error("删除 AI 配置失败:", error);
    return NextResponse.json({ error: "删除配置失败" }, { status: 500 });
  }
}


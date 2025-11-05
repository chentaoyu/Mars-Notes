import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/user/avatar - 更新头像
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const { image } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "头像URL不能为空", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    // 简单的URL验证
    try {
      new URL(image);
    } catch {
      return NextResponse.json(
        { error: "无效的图片URL", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    // 更新用户头像
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "头像更新成功",
      user: updatedUser,
    });
  } catch (error) {
    console.error("更新头像失败:", error);
    return NextResponse.json(
      { error: "服务器错误", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/avatar - 删除头像（恢复默认）
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    // 清空头像
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "头像已删除",
      user: updatedUser,
    });
  } catch (error) {
    console.error("删除头像失败:", error);
    return NextResponse.json(
      { error: "服务器错误", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePasswordSchema } from "@/lib/validations";
import bcrypt from "bcrypt";

// PUT /api/user/password - 修改密码
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const result = updatePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "验证失败",
          message: result.error.errors[0].message,
          code: "VALIDATION_ERROR",
        },
        { status: 422 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "用户不存在", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "当前密码错误", code: "INVALID_PASSWORD" },
        { status: 401 }
      );
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "密码修改成功，请重新登录",
    });
  } catch (error) {
    console.error("修改密码失败:", error);
    return NextResponse.json(
      { error: "服务器错误", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}


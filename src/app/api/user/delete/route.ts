import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteAccountSchema } from "@/lib/validations";
import bcrypt from "bcrypt";

// DELETE /api/user/delete - 注销账户
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const result = deleteAccountSchema.safeParse(body);

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

    const { password } = result.data;

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

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "密码错误", code: "INVALID_PASSWORD" },
        { status: 401 }
      );
    }

    // 删除用户及其所有关联数据（级联删除）
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: "账户已注销",
    });
  } catch (error) {
    console.error("注销账户失败:", error);
    return NextResponse.json(
      { error: "服务器错误", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}


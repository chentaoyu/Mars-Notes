import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations";

// PUT /api/user/name - 修改昵称
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateUserSchema.safeParse(body);

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

    const { name } = result.data;

    if (!name) {
      return NextResponse.json(
        { error: "昵称不能为空", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    // 更新用户昵称
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "昵称修改成功",
      user: updatedUser,
    });
  } catch (error) {
    console.error("修改昵称失败:", error);
    return NextResponse.json(
      { error: "服务器错误", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 标签创建验证 schema
const createTagSchema = z.object({
  name: z.string().min(1, "标签名称不能为空").max(50, "标签名称不能超过50个字符"),
  color: z.string().max(20).optional(),
});

// GET /api/tags - 获取用户的所有标签
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;

    // 获取标签列表，包含使用次数
    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: tags,
      message: "获取标签列表成功",
    });
  } catch (error) {
    console.error("获取标签列表失败:", error);
    return NextResponse.json({ error: "服务器错误", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// POST /api/tags - 创建新标签
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在", code: "USER_NOT_FOUND" }, { status: 404 });
    }

    const body = await request.json();

    // 验证请求数据
    const result = createTagSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "数据验证失败",
          code: "VALIDATION_ERROR",
          details: result.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, color } = result.data;

    // 标签名称已由数据库唯一约束保护，尝试创建
    try {
      const tag = await prisma.tag.create({
        data: {
          userId,
          name,
          color,
        },
        include: {
          _count: {
            select: { notes: true },
          },
        },
      });

      return NextResponse.json(
        {
          data: tag,
          message: "标签创建成功",
        },
        { status: 201 }
      );
    } catch (error: any) {
      // 检查是否为唯一性约束错误
      if (error.code === "P2002") {
        return NextResponse.json({ error: "标签名称已存在", code: "TAG_EXISTS" }, { status: 400 });
      }
      // 检查是否为外键约束错误
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "用户不存在，请先登录", code: "USER_NOT_FOUND" },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("创建标签失败:", error);
    return NextResponse.json({ error: "服务器错误", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

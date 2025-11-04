import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 笔记本创建验证 schema
const createNotebookSchema = z.object({
  name: z.string().min(1, "笔记本名称不能为空").max(100, "笔记本名称不能超过100个字符"),
  description: z.string().max(500, "笔记本描述不能超过500个字符").optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(50).optional(),
});

// GET /api/notebooks - 获取用户的所有笔记本
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;

    // 获取笔记本列表，包含笔记数量
    const notebooks = await prisma.notebook.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      data: notebooks,
      message: "获取笔记本列表成功",
    });
  } catch (error) {
    console.error("获取笔记本列表失败:", error);
    return NextResponse.json({ error: "服务器错误", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// POST /api/notebooks - 创建新笔记本
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // 验证请求数据
    const result = createNotebookSchema.safeParse(body);
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

    const { name, description, color, icon } = result.data;

    // 检查是否已存在同名笔记本
    const existingNotebook = await prisma.notebook.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (existingNotebook) {
      return NextResponse.json(
        { error: "笔记本名称已存在", code: "NOTEBOOK_EXISTS" },
        { status: 400 }
      );
    }

    // 获取当前最大的 sortOrder
    const maxSortOrder = await prisma.notebook.findFirst({
      where: { userId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    // 创建笔记本
    const notebook = await prisma.notebook.create({
      data: {
        userId,
        name,
        description,
        color,
        icon,
        sortOrder: (maxSortOrder?.sortOrder ?? -1) + 1,
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    return NextResponse.json(
      {
        data: notebook,
        message: "笔记本创建成功",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("创建笔记本失败:", error);
    return NextResponse.json({ error: "服务器错误", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

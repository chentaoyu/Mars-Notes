import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 笔记本更新验证 schema
const updateNotebookSchema = z.object({
  name: z.string().min(1, "笔记本名称不能为空").max(100, "笔记本名称不能超过100个字符").optional(),
  description: z.string().max(500, "笔记本描述不能超过500个字符").optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().optional(),
});

// GET /api/notebooks/[id] - 获取单个笔记本
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: notebookId } = await params;

    const notebook = await prisma.notebook.findUnique({
      where: { id: notebookId },
      include: {
        _count: {
          select: { 
            notes: true,
          },
        },
      },
    });

    if (!notebook) {
      return NextResponse.json(
        { error: "笔记本不存在", code: "NOTEBOOK_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 检查笔记本所有权
    if (notebook.userId !== userId) {
      return NextResponse.json({ error: "无权访问此笔记本", code: "FORBIDDEN" }, { status: 403 });
    }

    return NextResponse.json({
      data: notebook,
      message: "获取笔记本成功",
    });
  } catch (error) {
    console.error("获取笔记本失败:", error);
    return NextResponse.json({ error: "服务器错误", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// PUT /api/notebooks/[id] - 更新笔记本
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: notebookId } = await params;

    // 验证笔记本存在且属于当前用户
    const existingNotebook = await prisma.notebook.findUnique({
      where: { id: notebookId },
    });

    if (!existingNotebook) {
      return NextResponse.json(
        { error: "笔记本不存在", code: "NOTEBOOK_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (existingNotebook.userId !== userId) {
      return NextResponse.json({ error: "无权访问此笔记本", code: "FORBIDDEN" }, { status: 403 });
    }

    const body = await request.json();

    // 验证请求数据
    const result = updateNotebookSchema.safeParse(body);
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

    const { name, description, color, icon, sortOrder } = result.data;

    // 如果更新名称，检查是否已存在同名笔记本（在同一父级下）
    if (name && name !== existingNotebook.name) {
      const duplicateNotebook = await prisma.notebook.findFirst({
        where: {
          userId,
          name,
          parentId: existingNotebook.parentId,
          id: { not: notebookId },
        },
      });

      if (duplicateNotebook) {
        return NextResponse.json(
          { error: "笔记本名称已存在", code: "NOTEBOOK_EXISTS" },
          { status: 400 }
        );
      }
    }

    // 更新笔记本
    const notebook = await prisma.notebook.update({
      where: { id: notebookId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    return NextResponse.json({
      data: notebook,
      message: "笔记本更新成功",
    });
  } catch (error) {
    console.error("更新笔记本失败:", error);
    return NextResponse.json({ error: "服务器错误", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// DELETE /api/notebooks/[id] - 删除笔记本
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: notebookId } = await params;

    // 验证笔记本存在且属于当前用户
    const notebook = await prisma.notebook.findUnique({
      where: { id: notebookId },
      include: {
        _count: {
          select: { 
            notes: true,
          },
        },
      },
    });

    if (!notebook) {
      return NextResponse.json(
        { error: "笔记本不存在", code: "NOTEBOOK_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (notebook.userId !== userId) {
      return NextResponse.json({ error: "无权访问此笔记本", code: "FORBIDDEN" }, { status: 403 });
    }

    // 检查是否有笔记或子笔记本
    const childrenCount = await prisma.notebook.count({
      where: { parentId: notebookId },
    });
    
    if (notebook._count.notes > 0 || childrenCount > 0) {
      return NextResponse.json(
        {
          error: "笔记本中还有笔记或子笔记本，无法删除",
          code: "NOTEBOOK_NOT_EMPTY",
        },
        { status: 400 }
      );
    }

    // 删除笔记本
    await prisma.notebook.delete({
      where: { id: notebookId },
    });

    return NextResponse.json({
      message: "笔记本删除成功",
    });
  } catch (error) {
    console.error("删除笔记本失败:", error);
    return NextResponse.json({ error: "服务器错误", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

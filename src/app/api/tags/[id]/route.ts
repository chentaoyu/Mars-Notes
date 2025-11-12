import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 标签更新验证 schema
const updateTagSchema = z.object({
  name: z.string().min(1, "标签名称不能为空").max(50, "标签名称不能超过50个字符").optional(),
  color: z.string().max(20).optional().nullable(),
});

// GET /api/tags/[id] - 获取单个标签
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;
    const resolvedParams = await params;
    const tagId = resolvedParams?.id;

    // 验证标签 ID 是否存在
    if (!tagId) {
      return NextResponse.json(
        { error: "标签 ID 不能为空", code: "INVALID_TAG_ID" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: "标签不存在", code: "TAG_NOT_FOUND" }, { status: 404 });
    }

    // 检查标签所有权
    if (tag.userId !== userId) {
      return NextResponse.json({ error: "无权访问此标签", code: "FORBIDDEN" }, { status: 403 });
    }

    return NextResponse.json({
      data: tag,
      message: "获取标签成功",
    });
  } catch (error) {
    console.error("获取标签失败:", error);
    return NextResponse.json({ error: "服务器错误", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// PUT /api/tags/[id] - 更新标签
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;
    const resolvedParams = await params;
    const tagId = resolvedParams?.id;

    // 验证标签 ID 是否存在
    if (!tagId) {
      return NextResponse.json(
        { error: "标签 ID 不能为空", code: "INVALID_TAG_ID" },
        { status: 400 }
      );
    }

    // 验证标签存在且属于当前用户
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "标签不存在", code: "TAG_NOT_FOUND" }, { status: 404 });
    }

    if (existingTag.userId !== userId) {
      return NextResponse.json({ error: "无权访问此标签", code: "FORBIDDEN" }, { status: 403 });
    }

    const body = await request.json();

    // 验证请求数据
    const result = updateTagSchema.safeParse(body);
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

    try {
      // 更新标签
      const tag = await prisma.tag.update({
        where: { id: tagId },
        data: {
          ...(name !== undefined && { name }),
          ...(color !== undefined && { color }),
        },
        include: {
          _count: {
            select: { notes: true },
          },
        },
      });

      return NextResponse.json({
        data: tag,
        message: "标签更新成功",
      });
    } catch (error: any) {
      // 检查是否为唯一性约束错误
      if (error.code === "P2002") {
        return NextResponse.json({ error: "标签名称已存在", code: "TAG_EXISTS" }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error("更新标签失败:", error);
    return NextResponse.json({ error: "服务器错误", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// DELETE /api/tags/[id] - 删除标签
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
    const resolvedParams = await params;
    const tagId = resolvedParams?.id;

    // 验证标签 ID 是否存在
    if (!tagId) {
      return NextResponse.json(
        { error: "标签 ID 不能为空", code: "INVALID_TAG_ID" },
        { status: 400 }
      );
    }

    // 验证标签存在且属于当前用户
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      return NextResponse.json({ error: "标签不存在", code: "TAG_NOT_FOUND" }, { status: 404 });
    }

    if (tag.userId !== userId) {
      return NextResponse.json({ error: "无权访问此标签", code: "FORBIDDEN" }, { status: 403 });
    }

    // 删除标签（会级联删除 note_tags 关联）
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json({
      message: "标签删除成功",
    });
  } catch (error) {
    console.error("删除标签失败:", error);
    return NextResponse.json({ error: "服务器错误", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

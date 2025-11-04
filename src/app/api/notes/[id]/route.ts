import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateNoteSchema } from "@/lib/validations";

// GET /api/notes/[id] - 获取单个笔记
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const note = await prisma.note.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // 确保只能访问自己的笔记
      },
      include: {
        notebook: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        noteTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json(
        {
          error: "Note not found",
          message: "笔记不存在或无权访问",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // 转换数据格式
    const formattedNote = {
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
      noteTags: undefined,
    };

    return NextResponse.json(formattedNote);
  } catch (error) {
    console.error("获取笔记失败:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - 更新笔记
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 验证数据
    const result = updateNoteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: result.error.errors[0].message,
          code: "VALIDATION_ERROR",
        },
        { status: 422 }
      );
    }

    // 检查笔记是否存在且属于当前用户
    const existingNote = await prisma.note.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const { title, content, notebookId, tagIds } = result.data;

    // 更新笔记
    const note = await prisma.note.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(notebookId !== undefined && { notebookId }),
        // 如果提供了标签 ID 数组，先删除所有标签再重新创建
        ...(tagIds !== undefined && {
          noteTags: {
            deleteMany: {},
            create: tagIds.map((tagId: string) => ({
              tagId,
            })),
          },
        }),
      },
      include: {
        notebook: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        noteTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // 转换数据格式
    const formattedNote = {
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
      noteTags: undefined,
    };

    return NextResponse.json(formattedNote);
  } catch (error) {
    console.error("更新笔记失败:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - 删除笔记
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 检查笔记是否存在且属于当前用户
    const note = await prisma.note.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // 删除笔记
    await prisma.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "笔记已删除",
    });
  } catch (error) {
    console.error("删除笔记失败:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}


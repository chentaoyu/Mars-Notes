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

    return NextResponse.json(note);
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

    // 更新笔记
    const note = await prisma.note.update({
      where: { id: params.id },
      data: result.data,
    });

    return NextResponse.json(note);
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


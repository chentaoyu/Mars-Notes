import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNoteSchema } from "@/lib/validations";

// GET /api/notes - 获取笔记列表（支持高级过滤）
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const sort = searchParams.get("sort") || "updatedAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const search = searchParams.get("search") || "";
  const notebookId = searchParams.get("notebookId") || "";
  const tagIds = searchParams.get("tagIds")?.split(",").filter(Boolean) || [];

  const skip = (page - 1) * limit;

  try {
    // 构建查询条件
    const where: any = { userId: session.user.id };

    // 搜索过滤
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    // 笔记本过滤
    if (notebookId) {
      where.notebookId = notebookId;
    }

    // 标签过滤
    if (tagIds.length > 0) {
      where.noteTags = {
        some: {
          tagId: { in: tagIds },
        },
      };
    }

    // 查询笔记
    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy: { [sort]: order },
        take: limit,
        skip: skip,
        select: {
          id: true,
          title: true,
          content: true,
          notebookId: true,
          createdAt: true,
          updatedAt: true,
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
      }),
      prisma.note.count({
        where,
      }),
    ]);

    // 转换数据格式，将 noteTags 转为 tags
    const formattedNotes = notes.map((note) => ({
      ...note,
      tags: note.noteTags.map((nt) => nt.tag),
      noteTags: undefined,
    }));

    return NextResponse.json({
      data: formattedNotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取笔记列表失败:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

// POST /api/notes - 创建新笔记
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 验证数据
    const result = createNoteSchema.safeParse(body);
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

    const { title, content, notebookId, tagIds } = result.data;

    // 创建笔记
    const note = await prisma.note.create({
      data: {
        title,
        content: content || "",
        userId: session.user.id,
        notebookId: notebookId ?? null,
        noteTags: tagIds
          ? {
              create: tagIds.map((tagId: string) => ({
                tagId,
              })),
            }
          : undefined,
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

    return NextResponse.json(formattedNote, { status: 201 });
  } catch (error) {
    console.error("创建笔记失败:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

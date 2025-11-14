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
    // 调试：记录 session 信息
    if (process.env.NODE_ENV === "development") {
      console.log("创建笔记 - session.user.id:", session.user.id);
      console.log("创建笔记 - session.user:", session.user);
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user) {
      console.error("用户不存在 - session.user.id:", session.user.id);
      return NextResponse.json(
        {
          error: "User not found",
          message: "用户不存在，请重新登录",
          code: "USER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("用户验证通过 - user.id:", user.id);
    }

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

    // 使用已验证的用户 ID 创建笔记
    const userId = user.id;

    if (process.env.NODE_ENV === "development") {
      console.log("准备创建笔记 - userId:", userId);
    }

    // 创建笔记
    const note = await prisma.note.create({
      data: {
        title,
        content: content || "",
        userId: userId, // 使用已验证的用户 ID
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
  } catch (error: any) {
    console.error("创建笔记失败:", error);
    console.error("错误详情 - code:", error.code);
    console.error("错误详情 - meta:", JSON.stringify(error.meta, null, 2));
    console.error("错误详情 - session.user.id:", session?.user?.id);

    // 处理外键约束错误
    if (error.code === "P2003") {
      const field = error.meta?.field_name || "unknown";
      console.error("外键约束错误 - field_name:", field);
      console.error("外键约束错误 - 完整 meta:", error.meta);

      if (field.includes("user_id")) {
        return NextResponse.json(
          {
            error: "User not found",
            message: "用户不存在，请重新登录",
            code: "USER_NOT_FOUND",
          },
          { status: 404 }
        );
      }
      if (field.includes("notebook_id")) {
        return NextResponse.json(
          {
            error: "Notebook not found",
            message: "笔记本不存在",
            code: "NOTEBOOK_NOT_FOUND",
          },
          { status: 404 }
        );
      }
      if (field.includes("tag_id")) {
        return NextResponse.json(
          {
            error: "Tag not found",
            message: "标签不存在",
            code: "TAG_NOT_FOUND",
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

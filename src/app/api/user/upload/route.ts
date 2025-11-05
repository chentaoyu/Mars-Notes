import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

// POST /api/user/upload - 上传头像文件
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "请选择文件", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "仅支持 JPG、PNG、GIF 格式的图片", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    // 验证文件大小（2MB）
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "图片大小不能超过 2MB", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成唯一文件名
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${session.user.id}-${Date.now()}.${fileExtension}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "avatars");

    // 确保上传目录存在
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // 保存文件
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // 返回文件URL
    const fileUrl = `/uploads/avatars/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: "头像上传成功",
    });
  } catch (error) {
    console.error("上传头像失败:", error);
    return NextResponse.json(
      { error: "服务器错误", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}


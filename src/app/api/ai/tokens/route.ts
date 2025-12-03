import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 获取 Token 使用统计
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // 获取指定天数内的统计
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usages = await prisma.tokenUsage.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 计算总计
    const total = usages.reduce(
      (acc, usage) => ({
        promptTokens: acc.promptTokens + usage.promptTokens,
        completionTokens: acc.completionTokens + usage.completionTokens,
        totalTokens: acc.totalTokens + usage.totalTokens,
      }),
      { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    );

    // 按模型分组统计
    const byModel = usages.reduce((acc, usage) => {
      if (!acc[usage.model]) {
        acc[usage.model] = {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          count: 0,
        };
      }
      acc[usage.model].promptTokens += usage.promptTokens;
      acc[usage.model].completionTokens += usage.completionTokens;
      acc[usage.model].totalTokens += usage.totalTokens;
      acc[usage.model].count += 1;
      return acc;
    }, {} as Record<string, { promptTokens: number; completionTokens: number; totalTokens: number; count: number }>);

    // 按天分组统计
    const byDay = usages.reduce((acc, usage) => {
      const day = usage.createdAt.toISOString().split("T")[0];
      if (!acc[day]) {
        acc[day] = { totalTokens: 0, count: 0 };
      }
      acc[day].totalTokens += usage.totalTokens;
      acc[day].count += 1;
      return acc;
    }, {} as Record<string, { totalTokens: number; count: number }>);

    return NextResponse.json({
      success: true,
      data: {
        total,
        byModel,
        byDay,
        details: usages,
      },
    });
  } catch (error) {
    console.error("获取 Token 统计失败:", error);
    return NextResponse.json({ error: "获取统计失败" }, { status: 500 });
  }
}


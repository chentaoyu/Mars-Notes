import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DeepSeek API 端点
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// 发送聊天消息（流式传输）
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "未授权" }), { status: 401 });
    }

    const body = await request.json();
    const { sessionId, message } = body;

    if (!sessionId || !message) {
      return new Response(JSON.stringify({ error: "缺少必要参数" }), { status: 400 });
    }

    // 获取用户的 AI 配置
    const aiConfig = await prisma.aIConfig.findUnique({
      where: { userId: session.user.id },
    });

    if (!aiConfig) {
      return new Response(JSON.stringify({ error: "请先配置 AI 设置" }), { status: 400 });
    }

    // 验证会话是否属于当前用户
    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 20,
        },
      },
    });

    if (!chatSession) {
      return new Response(JSON.stringify({ error: "会话不存在" }), { status: 404 });
    }

    // 保存用户消息
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        userId: session.user.id,
        role: "user",
        content: message,
        model: aiConfig.model,
      },
    });

    // 构建消息历史
    const messages = [
      ...chatSession.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // 调用 DeepSeek API（流式传输）
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("DeepSeek API 错误:", error);
      return new Response(JSON.stringify({ error: "AI 服务调用失败" }), {
        status: response.status,
      });
    }

    // 创建流式响应
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const userId = session.user.id; // 提取 userId 供闭包使用
    let fullContent = "";
    let thinking = "";
    let isThinking = false;
    let totalTokens = 0;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 首先发送用户消息
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "user", message: userMessage })}\n\n`)
          );

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("无法读取响应流");
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices[0]?.delta;

                  if (delta?.content) {
                    const content = delta.content;

                    // 检测思考过程标记
                    if (content.includes("<think>")) {
                      isThinking = true;
                      const thinkStart = content.indexOf("<think>");
                      if (thinkStart > 0) {
                        fullContent += content.slice(0, thinkStart);
                      }
                      thinking += content.slice(thinkStart + 7);
                    } else if (content.includes("</think>")) {
                      isThinking = false;
                      const thinkEnd = content.indexOf("</think>");
                      thinking += content.slice(0, thinkEnd);
                      fullContent += content.slice(thinkEnd + 8);

                      // 发送思考过程
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: "thinking", content: thinking })}\n\n`
                        )
                      );
                    } else if (isThinking) {
                      thinking += content;
                    } else {
                      fullContent += content;
                      // 发送内容流
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: "content", content })}\n\n`)
                      );
                    }
                  }

                  // 获取 token 使用情况
                  if (parsed.usage) {
                    totalTokens = parsed.usage.total_tokens || 0;
                  }
                } catch (e) {
                  console.error("解析 SSE 数据失败:", e);
                }
              }
            }
          }

          // 保存 AI 回复
          const aiMessage = await prisma.chatMessage.create({
            data: {
              sessionId,
              userId,
              role: "assistant",
              content: fullContent || "抱歉，我无法回答。",
              model: aiConfig.model,
              tokens: totalTokens,
            },
          });

          // 记录 token 使用
          if (totalTokens > 0) {
            await prisma.tokenUsage.create({
              data: {
                userId,
                model: aiConfig.model,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens,
              },
            });
          }

          // 更新会话
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
          });

          // 如果是第一条消息，自动生成会话标题
          if (chatSession.messages.length === 0 && chatSession.title === "新对话") {
            const titleMessage = message.slice(0, 50) + (message.length > 50 ? "..." : "");
            await prisma.chatSession.update({
              where: { id: sessionId },
              data: { title: titleMessage },
            });
          }

          // 发送完成信号
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", message: aiMessage })}\n\n`)
          );

          controller.close();
        } catch (error) {
          console.error("流式传输错误:", error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error: "流式传输失败" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("发送消息失败:", error);
    return new Response(JSON.stringify({ error: "发送消息失败" }), { status: 500 });
  }
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Bot, User, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  isStreaming?: boolean;
  thinking?: string; // 仅用于流式传输时的临时显示
}

interface AIChatProps {
  sessionId: string;
  onTitleUpdate?: (title: string) => void;
}

export function AIChat({ sessionId, onTitleUpdate }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [streamingThinking, setStreamingThinking] = useState<string>("");
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/ai/sessions/${sessionId}`);
      if (response.ok) {
        const result = await response.json();
        setMessages(
          result.data.messages.map((msg: any) => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
            isStreaming: false,
          }))
        );
        // 如果是第一次加载且有消息，更新标题
        if (result.data.messages.length > 0 && onTitleUpdate) {
          onTitleUpdate(result.data.title);
        }
      }
    } catch (error) {
      console.error("获取消息失败:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    setStreamingThinking("");

    const tempUserMsgId = `temp-user-${Date.now()}`;
    const tempAiMsgId = `temp-ai-${Date.now()}`;

    try {
      // 创建 AbortController
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("请求失败");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("无法读取响应流");
      }

      let streamingContent = "";
      let streamingThinkingContent = "";
      let userMsgData: any = null;
      let aiMsgData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "user") {
                // 接收到用户消息
                userMsgData = parsed.message;
                setMessages((prev) => [
                  ...prev,
                  {
                    id: userMsgData.id,
                    role: "user",
                    content: userMsgData.content,
                    createdAt: new Date(userMsgData.createdAt),
                  },
                ]);
              } else if (parsed.type === "thinking") {
                // 接收到思考过程
                streamingThinkingContent = parsed.content;
                setStreamingThinking(parsed.content);
              } else if (parsed.type === "content") {
                // 接收到内容流
                streamingContent += parsed.content;

                // 更新或添加 AI 消息
                setMessages((prev) => {
                  const existingIndex = prev.findIndex((m) => m.id === tempAiMsgId);
                  const aiMsg: Message = {
                    id: tempAiMsgId,
                    role: "assistant",
                    content: streamingContent,
                    thinking: streamingThinkingContent || undefined,
                    createdAt: new Date(),
                    isStreaming: true,
                  };

                  if (existingIndex >= 0) {
                    const newMessages = [...prev];
                    newMessages[existingIndex] = aiMsg;
                    return newMessages;
                  } else {
                    return [...prev, aiMsg];
                  }
                });
              } else if (parsed.type === "done") {
                // 流传输完成
                aiMsgData = parsed.message;
                setStreamingThinking("");

                // 更新为最终消息（不包含 thinking，因为不保存到数据库）
                setMessages((prev) => {
                  const filtered = prev.filter((m) => m.id !== tempAiMsgId);
                  return [
                    ...filtered,
                    {
                      id: aiMsgData.id,
                      role: "assistant",
                      content: aiMsgData.content,
                      createdAt: new Date(aiMsgData.createdAt),
                      isStreaming: false,
                    },
                  ];
                });
              } else if (parsed.type === "error") {
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.error("解析 SSE 数据失败:", e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("请求已取消");
      } else {
        console.error("发送消息失败:", error);
        toast({
          title: "错误",
          description: "发送消息失败",
          variant: "destructive",
        });
        // 清理临时消息
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== tempUserMsgId && msg.id !== tempAiMsgId)
        );
      }
      setStreamingThinking("");
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot className="h-12 w-12 mb-4" />
            <p className="text-sm">开始对话吧</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                {/* 思考过程（仅在流式传输时显示，不保存到数据库） */}
                {message.role === "assistant" && message.isStreaming && message.thinking && (
                  <div className="mb-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
                      <Brain className="h-3 w-3" />
                      <span className="text-xs font-medium">思考过程</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {message.thinking}
                    </p>
                  </div>
                )}

                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-sm dark:prose-invert max-w-none"
                      >
                        {message.content}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
                      )}
                    </>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1 px-1">
                  {message.createdAt.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}

        {/* 流式思考过程展示 */}
        {loading && streamingThinking && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 max-w-[80%]">
              <div className="mb-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 animate-pulse">
                <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
                  <Brain className="h-3 w-3 animate-spin" />
                  <span className="text-xs font-medium">正在思考...</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {streamingThinking}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading 指示器 */}
        {loading && !streamingThinking && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 max-w-[80%]">
              <div className="inline-block p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">正在思考...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="border-t dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

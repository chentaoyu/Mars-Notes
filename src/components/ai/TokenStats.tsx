"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

interface TokenUsageData {
  total: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  byModel: Record<
    string,
    {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      count: number;
    }
  >;
}

export function TokenStats() {
  const [data, setData] = useState<TokenUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchStats();
  }, [days]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/ai/tokens?days=${days}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error("获取统计失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">加载中...</div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">暂无数据</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold">Token 使用统计</h3>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="text-sm border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value={7}>最近 7 天</option>
          <option value={30}>最近 30 天</option>
          <option value={90}>最近 90 天</option>
        </select>
      </div>

      {/* 总计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            输入 Tokens
          </div>
          <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            {data.total.promptTokens.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            输出 Tokens
          </div>
          <div className="text-xl font-semibold text-green-600 dark:text-green-400">
            {data.total.completionTokens.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            总计
          </div>
          <div className="text-xl font-semibold text-purple-600 dark:text-purple-400">
            {data.total.totalTokens.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 按模型统计 */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          按模型统计
        </h4>
        {Object.entries(data.byModel).map(([model, stats]) => (
          <div
            key={model}
            className="p-3 border rounded-lg dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{model}</span>
              <span className="text-xs text-gray-500">
                {stats.count} 次调用
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-500 dark:text-gray-400">输入</div>
                <div className="font-medium">
                  {stats.promptTokens.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">输出</div>
                <div className="font-medium">
                  {stats.completionTokens.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">总计</div>
                <div className="font-medium">
                  {stats.totalTokens.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


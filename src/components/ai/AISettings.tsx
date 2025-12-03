"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Key } from "lucide-react";

interface AIConfig {
  id?: string;
  provider: string;
  apiKey: string;
  model: string;
}

const DEEPSEEK_MODELS = [
  { value: "deepseek-chat", label: "DeepSeek Chat" },
  { value: "deepseek-coder", label: "DeepSeek Coder" },
];

export function AISettings() {
  const [config, setConfig] = useState<AIConfig>({
    provider: "deepseek",
    apiKey: "",
    model: "deepseek-chat",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/ai/config");
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setConfig(result.data);
        }
      }
    } catch (error) {
      console.error("获取配置失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.apiKey.trim()) {
      toast({
        title: "错误",
        description: "请输入 API Key",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast({
          title: "成功",
          description: "AI 配置已保存",
        });
      } else {
        throw new Error("保存失败");
      }
    } catch (error) {
      console.error("保存配置失败:", error);
      toast({
        title: "错误",
        description: "保存配置失败",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">加载中...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold">AI 设置</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provider">提供商</Label>
          <Select
            value={config.provider}
            onValueChange={(value) =>
              setConfig({ ...config, provider: value })
            }
          >
            <SelectTrigger id="provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deepseek">DeepSeek</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">模型</Label>
          <Select
            value={config.model}
            onValueChange={(value) => setConfig({ ...config, model: value })}
          >
            <SelectTrigger id="model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEEPSEEK_MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Key
            </div>
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="sk-..."
            value={config.apiKey}
            onChange={(e) =>
              setConfig({ ...config, apiKey: e.target.value })
            }
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            获取 API Key：
            <a
              href="https://platform.deepseek.com/api_keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              DeepSeek 控制台
            </a>
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "保存中..." : "保存配置"}
        </Button>
      </div>
    </div>
  );
}


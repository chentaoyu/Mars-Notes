"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  saving: boolean;
  lastSaved: Date | null;
}

export function AutoSaveIndicator({ saving, lastSaved }: AutoSaveIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t text-sm text-muted-foreground">
      {saving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>保存中...</span>
        </>
      ) : lastSaved ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span>
            已保存 · {new Date(lastSaved).toLocaleTimeString("zh-CN")}
          </span>
        </>
      ) : (
        <span>等待编辑...</span>
      )}
    </div>
  );
}


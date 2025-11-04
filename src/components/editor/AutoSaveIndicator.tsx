"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  saving: boolean;
  lastSaved: Date | null;
}

export function AutoSaveIndicator({ saving, lastSaved }: AutoSaveIndicatorProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border-t text-xs sm:text-sm text-muted-foreground">
      {saving ? (
        <>
          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          <span>保存中...</span>
        </>
      ) : lastSaved ? (
        <>
          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          <span className="truncate">
            已保存 · {new Date(lastSaved).toLocaleTimeString("zh-CN")}
          </span>
        </>
      ) : (
        <span>等待编辑...</span>
      )}
    </div>
  );
}


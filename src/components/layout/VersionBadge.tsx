"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export function VersionBadge() {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    // 在客户端获取版本号
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => setVersion(data.version || "1"))
      .catch(() => setVersion("1"));
  }, []);

  if (!version) return null;

  return (
    <Badge variant="outline" className="text-xs font-mono">
      v{version}
    </Badge>
  );
}

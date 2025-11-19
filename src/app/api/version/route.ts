import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const versionPath = join(process.cwd(), "version.json");
    const versionData = JSON.parse(readFileSync(versionPath, "utf-8"));
    
    // 兼容旧格式和新格式
    if (versionData.version !== undefined) {
      // 旧格式：只有 version 字段
      return NextResponse.json({ version: String(versionData.version) });
    }
    
    // 新格式：major.minor.patch
    const major = versionData.major || 1;
    const minor = versionData.minor || 0;
    const patch = versionData.patch || 0;
    const version = `${major}.${minor}.${patch}`;
    
    return NextResponse.json({ version });
  } catch (error) {
    return NextResponse.json({ version: "1.0.0" });
  }
}

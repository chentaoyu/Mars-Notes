import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const versionPath = join(process.cwd(), "version.json");
    const versionData = JSON.parse(readFileSync(versionPath, "utf-8"));
    return NextResponse.json({ version: versionData.version });
  } catch (error) {
    return NextResponse.json({ version: "1" });
  }
}

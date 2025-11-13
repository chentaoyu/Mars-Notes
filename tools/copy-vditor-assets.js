/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const sourceDir = path.resolve(__dirname, "../node_modules/vditor/dist");
const targetDir = path.resolve(__dirname, "../public/vendor/vditor/dist");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyVditorAssets() {
  if (!fs.existsSync(sourceDir)) {
    console.warn("[copy-vditor-assets] 未找到 Vditor 资源目录，跳过复制。");
    return;
  }

  ensureDir(path.dirname(targetDir));

  try {
    fs.rmSync(targetDir, { recursive: true, force: true });
    fs.cpSync(sourceDir, targetDir, { recursive: true });
    console.log("[copy-vditor-assets] 已将 Vditor 静态资源复制到 public/vendor/vditor/dist。");
  } catch (error) {
    console.error("[copy-vditor-assets] 复制 Vditor 静态资源失败：", error);
    process.exitCode = 1;
  }
}

copyVditorAssets();


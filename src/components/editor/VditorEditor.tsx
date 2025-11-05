"use client";

import { useEffect, useRef, useState } from "react";
import Vditor from "vditor";
import "vditor/dist/index.css";

interface VditorEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

export function VditorEditor({ content, onContentChange }: VditorEditorProps) {
  const [vd, setVd] = useState<Vditor>();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<string>(content);
  const onChangeRef = useRef(onContentChange);
  const isInitializedRef = useRef(false);

  // 更新回调引用
  useEffect(() => {
    onChangeRef.current = onContentChange;
  }, [onContentChange]);

  // 初始化 Vditor
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    contentRef.current = content;

    const vditor = new Vditor("vditor", {
      height: "100%",
      mode: "sv", // 分屏预览模式
      preview: {
        delay: 300,
        hljs: {
          enable: true,
          style: "github",
          lineNumber: true,
        },
        markdown: {
          toc: true,
          footnotes: true,
          autoSpace: true,
          fixTermTypo: true,
        },
        math: {
          engine: "KaTeX",
        },
      },
      input: (value: string) => {
        if (value !== contentRef.current) {
          contentRef.current = value;
          onChangeRef.current(value);
        }
      },
      toolbar: [
        "headings",
        "bold",
        "italic",
        "strike",
        "|",
        "line",
        "quote",
        "list",
        "ordered-list",
        "check",
        "outdent",
        "indent",
        "|",
        "code",
        "inline-code",
        "insert-before",
        "insert-after",
        "|",
        "link",
        "table",
        "|",
        "undo",
        "redo",
        "|",
        "fullscreen",
        "edit-mode",
        "preview-mode",
        "both",
        "|",
        "outline",
        "help",
      ],
      cache: {
        enable: false, // 禁用缓存，因为我们自己管理内容
      },
      after: () => {
        // 设置初始内容
        if (contentRef.current) {
          vditor.setValue(contentRef.current);
        }
        setVd(vditor);
        isInitializedRef.current = true;
      },
    });

    return () => {
      isInitializedRef.current = false;
    };
  }, []);

  // 同步外部内容变化到编辑器
  useEffect(() => {
    if (vd && content !== contentRef.current) {
      const currentValue = vd.getValue();
      if (currentValue !== content) {
        contentRef.current = content;
        vd.setValue(content);
      }
    }
  }, [content, vd]);

  return (
    <div ref={containerRef} className="vditor-container h-full w-full">
      <div id="vditor" className="h-full w-full" />
    </div>
  );
}

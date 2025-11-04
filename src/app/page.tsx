import { redirect } from "next/navigation";

export default function Home() {
  // 重定向到笔记列表页
  redirect("/notes");
}


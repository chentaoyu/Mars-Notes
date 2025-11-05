import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <ProfilePageClient />;
}


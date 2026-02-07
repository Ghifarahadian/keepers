import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth-actions";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const user = await getUserProfile();

  if (!user) {
    redirect("/");
  }

  return <ProfileClient user={user} />;
}

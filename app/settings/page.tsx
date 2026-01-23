import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth-actions";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const user = await getUserProfile();

  if (!user) {
    redirect("/");
  }

  return <SettingsClient user={user} />;
}

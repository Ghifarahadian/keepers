import { redirect } from "next/navigation"
import { getAdminProfile } from "@/lib/admin-actions"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAdminProfile()

  if (!admin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-background)" }}>
      <AdminSidebar admin={admin} />
      <main className="flex-1 ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}

import { getAdminCategories } from "@/lib/admin-actions"
import { CategoryList } from "@/components/admin/categories/category-list"

export default async function CategoriesPage() {
  const categories = await getAdminCategories()

  return (
    <div>
      <h1
        className="text-2xl font-bold mb-8"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--color-neutral)",
        }}
      >
        Categories
      </h1>

      <CategoryList categories={categories} />
    </div>
  )
}

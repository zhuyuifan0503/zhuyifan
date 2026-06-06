import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ImportForm from "@/components/ImportForm";

export const metadata = {
  title: "导入内容 — 管理后台",
};

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (adminToken !== adminPassword) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const activeTab = params.tab || "chatgpt";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">📥 导入内容</h1>
      <ImportForm activeTab={activeTab} />
    </div>
  );
}

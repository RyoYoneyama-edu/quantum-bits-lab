"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-[220px_1fr] gap-6 px-4 py-10">
        <AdminSidebar />
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

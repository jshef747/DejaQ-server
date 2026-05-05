export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="ds-app">
      <Suspense fallback={<aside className="ds-sidebar" style={{ width: "220px", minWidth: 0 }} />}>
        <Sidebar email={user.email ?? "unknown"} />
      </Suspense>
      <main className="ds-main">
        {children}
      </main>
    </div>
  );
}

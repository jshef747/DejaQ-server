"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { DepartmentItem, DeptStatsReport } from "@/lib/types";

export async function listDepartments(orgSlug: string): Promise<DepartmentItem[]> {
  const res = await apiFetch(`/admin/v1/departments?org=${encodeURIComponent(orgSlug)}`);
  if (!res.ok) throw new Error(`Failed to load departments (${res.status})`);
  return res.json() as Promise<DepartmentItem[]>;
}

export async function listDeptStats(orgSlug: string): Promise<DeptStatsReport> {
  const res = await apiFetch(`/admin/v1/stats/orgs/${encodeURIComponent(orgSlug)}/departments`);
  if (!res.ok) throw new Error(`Failed to load department stats (${res.status})`);
  return res.json() as Promise<DeptStatsReport>;
}

export async function createDepartment(
  orgSlug: string,
  name: string,
): Promise<{ ok: true; dept: DepartmentItem } | { ok: false; error: string }> {
  let res: Response;
  try {
    res = await apiFetch(`/admin/v1/orgs/${encodeURIComponent(orgSlug)}/departments`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  if (!res.ok) {
    let msg = `Create failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.detail) msg = j.detail;
      else if (j?.message) msg = j.message;
    } catch {}
    return { ok: false, error: msg };
  }

  const dept = (await res.json()) as DepartmentItem;
  revalidatePath("/dashboard/departments");
  return { ok: true, dept };
}

export async function deleteDepartment(
  orgSlug: string,
  deptSlug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  let res: Response;
  try {
    res = await apiFetch(
      `/admin/v1/orgs/${encodeURIComponent(orgSlug)}/departments/${encodeURIComponent(deptSlug)}`,
      { method: "DELETE" },
    );
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  if (!res.ok) {
    let msg = `Delete failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.detail) msg = j.detail;
      else if (j?.message) msg = j.message;
    } catch {}
    return { ok: false, error: msg };
  }

  revalidatePath("/dashboard/departments");
  return { ok: true };
}

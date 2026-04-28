"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { ApiKeyCreated, ApiKeyItem } from "@/lib/types";

export async function listKeys(orgSlug: string): Promise<ApiKeyItem[]> {
  const res = await apiFetch(`/admin/v1/orgs/${encodeURIComponent(orgSlug)}/keys`);
  if (!res.ok) throw new Error(`Failed to load API keys (${res.status})`);
  return res.json() as Promise<ApiKeyItem[]>;
}

export async function generateKey(
  orgSlug: string,
  force = false,
): Promise<{ ok: true; key: ApiKeyCreated } | { ok: false; error: string; conflict?: true }> {
  let res: Response;
  try {
    const url = `/admin/v1/orgs/${encodeURIComponent(orgSlug)}/keys${force ? "?force=true" : ""}`;
    res = await apiFetch(url, { method: "POST" });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  if (res.status === 409) {
    return { ok: false, error: "Active key exists — use Rotate to replace it.", conflict: true };
  }

  if (!res.ok) {
    let msg = `Generate failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.detail) msg = j.detail;
      else if (j?.message) msg = j.message;
    } catch {}
    return { ok: false, error: msg };
  }

  const key = (await res.json()) as ApiKeyCreated;
  revalidatePath("/dashboard/keys");
  return { ok: true, key };
}

export async function revokeKey(
  keyId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  let res: Response;
  try {
    res = await apiFetch(`/admin/v1/keys/${keyId}`, { method: "DELETE" });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  if (!res.ok) {
    let msg = `Revoke failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.detail) msg = j.detail;
      else if (j?.message) msg = j.message;
    } catch {}
    return { ok: false, error: msg };
  }

  revalidatePath("/dashboard/keys");
  return { ok: true };
}

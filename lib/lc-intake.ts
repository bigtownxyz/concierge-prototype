/**
 * Server-side wrapper for the LC Command Centre intake endpoint.
 * Sends the qualification form payload to the CRM with a shared bearer secret.
 *
 * Failures are non-fatal — callers should swallow them so the user's flow
 * isn't blocked by CRM availability. Errors are logged.
 */

export interface LcQualificationIntakePayload {
  email: string;
  name: string;
  phone?: string | null;
  country?: string | null;
  nationality?: string | null;
  qualification: {
    strategicFocus: string[];
    investmentAmount: number | null;
    timeline: string | null;
    familyMembers: Array<{
      id?: string;
      relation: "spouse" | "parent" | "sibling" | "child";
      nationality: string;
      age: number;
    }>;
    dependants: number;
    isUsCitizen: boolean | null;
    consideringRenouncing: boolean | null;
    constraints: string[];
    constraintDetail: string | null;
    situation: string | null;
    selectedPrograms: string[];
    programScores: Record<string, number>;
  };
  signedUp?: boolean;
  conciergeUserId?: string | null;
}

interface LcSignupUpdatePayload {
  email: string;
  conciergeUserId?: string | null;
}

function getConfig(): { url: string; secret: string } | null {
  const url = process.env.LC_INTAKE_URL?.trim();
  const secret = process.env.LC_INTAKE_SECRET?.trim();
  if (!url || !secret) {
    console.warn("[lc-intake] LC_INTAKE_URL or LC_INTAKE_SECRET not set — skipping CRM push.");
    return null;
  }
  return { url, secret };
}

export async function pushQualificationToLc(
  payload: LcQualificationIntakePayload
): Promise<{ ok: boolean; submissionId?: string; error?: string }> {
  const cfg = getConfig();
  if (!cfg) return { ok: false, error: "LC intake not configured." };

  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.secret}`,
      },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      submissionId?: string;
      error?: string;
    };
    if (!res.ok || !data.ok) {
      console.error(
        "[lc-intake] POST failed",
        res.status,
        data.error ?? "(no error body)"
      );
      return { ok: false, error: data.error ?? `LC returned ${res.status}` };
    }
    return { ok: true, submissionId: data.submissionId };
  } catch (err) {
    console.error("[lc-intake] POST threw", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error.",
    };
  }
}

export async function markSignupInLc(
  payload: LcSignupUpdatePayload
): Promise<{ ok: boolean; error?: string }> {
  const cfg = getConfig();
  if (!cfg) return { ok: false, error: "LC intake not configured." };

  try {
    const res = await fetch(cfg.url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.secret}`,
      },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    if (!res.ok || !data.ok) {
      console.error(
        "[lc-intake] PATCH failed",
        res.status,
        data.error ?? "(no error body)"
      );
      return { ok: false, error: data.error ?? `LC returned ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[lc-intake] PATCH threw", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error.",
    };
  }
}

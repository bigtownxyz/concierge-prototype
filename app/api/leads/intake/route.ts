/**
 * Proxy route — the QualifyModal POSTs here from the browser. We forward to
 * LC Command Centre's intake endpoint with the shared secret server-side, so
 * the secret never reaches the client.
 *
 * - POST: full qualification submission (creates contact + submission in LC).
 * - PATCH: signup update (marks the latest submission for that email as
 *   signed_up).
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  pushQualificationToLc,
  markSignupInLc,
} from "@/lib/lc-intake";

const FamilyMemberSchema = z.object({
  id: z.string().optional(),
  relation: z.enum(["spouse", "parent", "sibling", "child"]),
  nationality: z.string().max(100),
  age: z.number().int().min(0).max(120),
});

const QualificationSchema = z.object({
  strategicFocus: z.array(z.string().max(50)).max(10),
  investmentAmount: z.number().int().min(0).max(1_000_000_000).nullable(),
  timeline: z.string().max(50).nullable(),
  familyMembers: z.array(FamilyMemberSchema).max(20),
  dependants: z.number().int().min(0).max(50),
  isUsCitizen: z.boolean().nullable(),
  consideringRenouncing: z.boolean().nullable(),
  constraints: z.array(z.string().max(100)).max(20),
  constraintDetail: z.string().max(2000).nullable(),
  situation: z.string().max(5000).nullable(),
  selectedPrograms: z.array(z.string().max(80)).max(30),
  programScores: z.record(z.string(), z.number()),
});

const PostSchema = z.object({
  email: z.email().max(200),
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(50).nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(),
  nationality: z.string().trim().max(100).nullable().optional(),
  qualification: QualificationSchema,
  signedUp: z.boolean().optional(),
  conciergeUserId: z.uuid().nullable().optional(),
});

const PatchSchema = z.object({
  email: z.email().max(200),
  conciergeUserId: z.uuid().nullable().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    console.error("[leads/intake] POST validation failed", JSON.stringify({
      issues: parsed.error.issues,
      body,
    }));
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const result = await pushQualificationToLc(parsed.data);
  if (!result.ok) {
    // Fail open — return 200 so the user's modal flow isn't blocked.
    // The LC failure has already been logged server-side.
    return NextResponse.json({ ok: true, lcOk: false, lcError: result.error });
  }
  return NextResponse.json({ ok: true, lcOk: true, submissionId: result.submissionId });
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    console.error("[leads/intake] PATCH validation failed", JSON.stringify({
      issues: parsed.error.issues,
      body,
    }));
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const result = await markSignupInLc(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ ok: true, lcOk: false, lcError: result.error });
  }
  return NextResponse.json({ ok: true, lcOk: true });
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

const font = "var(--font-manrope, 'Manrope', sans-serif)";
const inputStyle: React.CSSProperties = {
  background: "#0a0e14",
  border: "1px solid rgba(69,71,75,0.3)",
  borderRadius: "0.5rem",
  color: "#dfe2eb",
  fontFamily: font,
  fontSize: "0.8125rem",
  padding: "0.5rem 0.75rem",
  width: "100%",
  outline: "none",
};

interface ProfileData {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  nationality: string | null;
}

interface QualData {
  strategic_focus: string[];
  investment_amount: number;
  timeline: string | null;
  dependants: number | null;
  situation: string | null;
}

function formatInvestment(amount: number): string {
  if (amount >= 5_000_000) return "$5M+";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  return `$${(amount / 1_000).toFixed(0)}K`;
}

function formatTimeline(t: string | null): string {
  if (t === "immediate") return "Immediate (0-6 months)";
  if (t === "strategic") return "Strategic (6-18 months)";
  if (t === "long-term") return "Long-term Planning";
  return t || "—";
}

const FOCUS_LABELS: Record<string, string> = {
  mobility: "Global Mobility",
  tax: "Tax Optimisation",
  family: "Family Security",
  assets: "Asset Diversification",
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [qual, setQual] = useState<QualData | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    country: "",
    nationality: "",
    situation: "",
  });

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, email, phone, country, nationality")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(p ?? null);

      const { data: q } = await supabase
        .from("qualifications")
        .select("strategic_focus, investment_amount, timeline, dependants, situation")
        .eq("user_id", user.id)
        .maybeSingle();
      setQual(q ?? null);

      setForm({
        full_name: p?.full_name || "",
        phone: p?.phone || "",
        country: p?.country || "",
        nationality: p?.nationality || "",
        situation: q?.situation || "",
      });

      setLoading(false);
    })();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from("profiles").update({
      full_name: form.full_name || null,
      phone: form.phone || null,
      country: form.country || null,
      nationality: form.nationality || null,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    if (qual) {
      await supabase.from("qualifications").update({
        situation: form.situation || null,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    }

    setSaving(false);
    setEditing(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#10141a" }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#bbc4f7", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const rows: { label: string; value: string; icon: string; field?: keyof typeof form }[] = [
    { label: "Full Name", value: profile?.full_name || "—", icon: "person", field: "full_name" },
    { label: "Email", value: profile?.email || "—", icon: "mail" },
    { label: "Phone", value: profile?.phone || "—", icon: "call", field: "phone" },
    { label: "Country of Residence", value: profile?.country || "—", icon: "location_on", field: "country" },
    { label: "Current Citizenships", value: profile?.nationality || "—", icon: "public", field: "nationality" },
  ];

  return (
    <div className="min-h-screen py-12 px-6" style={{ background: "#10141a", fontFamily: font }}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/results" className="text-xs flex items-center gap-1 mb-3" style={{ color: "#8f9095" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
                Back to My Application
              </Link>
              <h1 className="text-2xl font-semibold" style={{ color: "#dfe2eb" }}>Your Profile</h1>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="text-sm px-4 py-2 rounded-xl" style={{ color: "#8f9095" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="text-sm px-4 py-2 rounded-xl font-semibold" style={{ background: "#bbc4f7", color: "#242d58" }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#bbc4f7" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                Edit
              </button>
            )}
          </div>

          {/* Personal Details */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: "#1c2026", border: "1px solid rgba(69,71,75,0.15)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#8f9095" }}>Personal Details</h3>
            <div className="flex flex-col gap-4">
              {rows.map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="material-symbols-outlined flex-shrink-0 mt-1" style={{ fontSize: 18, color: "#8f9095" }}>{row.icon}</span>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#8f9095" }}>{row.label}</p>
                    {editing && row.field ? (
                      <input
                        type="text"
                        value={form[row.field]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [row.field!]: e.target.value }))}
                        style={inputStyle}
                      />
                    ) : (
                      <p className="text-sm font-medium" style={{ color: "#c6c6cb" }}>{row.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Qualification Details */}
          {qual && (
            <div className="rounded-2xl p-6 mb-6" style={{ background: "#1c2026", border: "1px solid rgba(69,71,75,0.15)" }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#8f9095" }}>Qualification Details</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined flex-shrink-0 mt-1" style={{ fontSize: 18, color: "#8f9095" }}>payments</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#8f9095" }}>Estimated Budget</p>
                    <p className="text-sm font-medium" style={{ color: "#c6c6cb" }}>{formatInvestment(qual.investment_amount)}</p>
                  </div>
                </div>
                {qual.timeline && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined flex-shrink-0 mt-1" style={{ fontSize: 18, color: "#8f9095" }}>schedule</span>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#8f9095" }}>Timeline</p>
                      <p className="text-sm font-medium" style={{ color: "#c6c6cb" }}>{formatTimeline(qual.timeline)}</p>
                    </div>
                  </div>
                )}
                {qual.dependants != null && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined flex-shrink-0 mt-1" style={{ fontSize: 18, color: "#8f9095" }}>group</span>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#8f9095" }}>Family Members</p>
                      <p className="text-sm font-medium" style={{ color: "#c6c6cb" }}>{qual.dependants}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Strategic Focus */}
              {qual.strategic_focus && qual.strategic_focus.length > 0 && (
                <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(69,71,75,0.15)" }}>
                  <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#8f9095" }}>Strategic Focus</p>
                  <div className="flex flex-wrap gap-2">
                    {qual.strategic_focus.map((f) => (
                      <span key={f} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "rgba(187,196,247,0.08)", border: "1px solid rgba(187,196,247,0.2)", color: "#bbc4f7" }}>
                        {FOCUS_LABELS[f] || f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Situation */}
              <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(69,71,75,0.15)" }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#8f9095" }}>Situation</p>
                {editing ? (
                  <textarea
                    value={form.situation}
                    onChange={(e) => setForm((prev) => ({ ...prev, situation: e.target.value }))}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                ) : (
                  <p className="text-sm leading-relaxed" style={{ color: "#c6c6cb" }}>{qual.situation || "—"}</p>
                )}
              </div>
            </div>
          )}

          {/* To change qualification answers */}
          <p className="text-xs text-center" style={{ color: "#8f9095" }}>
            To update your budget, timeline, or strategic focus,{" "}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-qualify-modal"))}
              className="font-semibold"
              style={{ color: "#bbc4f7" }}
            >
              retake the qualification
            </button>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}

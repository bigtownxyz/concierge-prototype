// Generates the Concierge fee table (CitizenX 10% model) for every programme.
// Run: npx tsx scripts/fee-table.ts
import { PROGRAMS } from "../lib/constants";

const RATE = 0.1;
const fmt = (n: number, cur: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

interface Row {
  name: string;
  country: string;
  type: string;
  region: string;
  currency: string;
  contribution: number | "";
  fee: number | "";
  allIn: number | "";
  notes: string;
  active: string;
}

const rows: Row[] = PROGRAMS.map((p) => {
  const inv = p.minInvestment;
  const base = {
    name: p.name,
    country: p.country,
    type: p.type,
    region: p.region,
    currency: p.currency,
    active: p.isActive ? "yes" : "no",
  };
  if (!inv || inv <= 0) {
    return { ...base, contribution: "", fee: "", allIn: "", notes: "By consultation (no fixed contribution)" };
  }
  const fee = Math.round(inv * RATE);
  return { ...base, contribution: inv, fee, allIn: inv + fee, notes: "+ govt fees & due diligence at cost" };
});

// ---- CSV (raw numbers, spreadsheet-friendly) ----
const header = [
  "Programme",
  "Country",
  "Type",
  "Region",
  "Currency",
  "Government contribution",
  "Service fee (10%)",
  "Indicative all-in",
  "Notes",
  "Active",
];
const esc = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [header.join(",")];
for (const r of rows) {
  csv.push([r.name, r.country, r.type, r.region, r.currency, r.contribution, r.fee, r.allIn, r.notes, r.active].map(esc).join(","));
}
console.log("===CSV===");
console.log(csv.join("\n"));

// ---- Readable markdown table (formatted currency) ----
console.log("\n===MARKDOWN===");
console.log("| Programme | Type | Currency | Govt contribution | Service fee (10%) | Indicative all-in | Active |");
console.log("|---|---|---|---|---|---|---|");
for (const r of rows) {
  const contribution = r.contribution === "" ? "by consultation" : fmt(r.contribution as number, r.currency);
  const fee = r.fee === "" ? "by consultation" : `from ${fmt(r.fee as number, r.currency)}`;
  const allIn = r.allIn === "" ? "by consultation" : `from ${fmt(r.allIn as number, r.currency)}`;
  console.log(`| ${r.name} | ${r.type} | ${r.currency} | ${contribution} | ${fee} | ${allIn} | ${r.active} |`);
}

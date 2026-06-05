/** Canonical production origin, used for metadata routes and structured data. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://thecitizenshipconcierge.com";

export const NAV_LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const STAGES = [
  { stage: 1, label: "Qualification", description: "Initial eligibility assessment" },
  { stage: 2, label: "Onboarding", description: "Welcome and advisor assignment" },
  { stage: 3, label: "Document Collection", description: "Gathering required documents" },
  { stage: 4, label: "Due Diligence", description: "Background verification" },
  { stage: 5, label: "Submission", description: "Application submitted to government" },
  { stage: 6, label: "Government Review", description: "Awaiting government decision" },
  { stage: 7, label: "Approval & Issuance", description: "Citizenship or residency granted" },
] as const;

/**
 * Slugs that have a hero image at /images/programs/{slug}.jpg.
 * Programmes not listed here render with the region gradient only —
 * keeps cards visually clean instead of showing broken-image icons.
 * Drop a JPG in /public/images/programs/ and add the slug here to enable.
 */
export const PROGRAM_IMAGE_SLUGS = new Set<string>([
  "antigua-and-barbuda",
  "argentina",
  "asset-protection-trust",
  "chile",
  "dominica",
  "dubai",
  "el-salvador",
  "georgia",
  "greece",
  "grenada",
  "panama",
  "portugal",
  "sao-tome",
  "serbia",
  "sierra-leone",
  "slovakia",
  "st-kitts-and-nevis",
  "st-lucia",
  "vanuatu",
]);

export function programHasImage(slug: string): boolean {
  return PROGRAM_IMAGE_SLUGS.has(slug);
}

export const REGIONS = [
  { value: "caribbean", label: "Caribbean", emoji: "🌴" },
  { value: "europe", label: "Europe", emoji: "🏰" },
  { value: "middle_east", label: "Middle East", emoji: "🕌" },
  { value: "africa", label: "Africa", emoji: "🦁" },
  { value: "asia_pacific", label: "Asia Pacific", emoji: "🏯" },
  { value: "south_america", label: "South America", emoji: "🌎" },
  { value: "central_america", label: "Central America", emoji: "🌮" },
  { value: "global", label: "Global", emoji: "🌐" },
] as const;

export type Region = (typeof REGIONS)[number]["value"];

export interface Program {
  name: string;
  slug: string;
  country: string;
  type: "CBI" | "Residency" | "Golden Visa" | "Trust";
  region: Region;
  minInvestment: number;
  maxInvestment: number | null;
  currency: string;
  processingTimeMonths: number | null;
  visaFreeCount: number | null;
  description: string;
  benefits: string[];
  requirements: string[];
  radarScores: {
    cost_score: number;
    speed_score: number;
    lifestyle_score: number;
    tax_score: number;
    travel_score: number;
  };
  excludedNationalities: string[];
  marketingHook: string;
  isActive: boolean;
  featured: boolean;
  exclusive: boolean;
  flagEmoji: string;
  /** Listed on /programs but enquiries closed until the route opens. */
  comingSoon?: boolean;
}

export const PROGRAMS: Program[] = [
  {
    name: "Antigua & Barbuda CBI",
    slug: "antigua-and-barbuda",
    country: "Antigua & Barbuda",
    type: "CBI",
    region: "caribbean",
    minInvestment: 270000,
    maxInvestment: 400000,
    currency: "USD",
    processingTimeMonths: 4,
    visaFreeCount: 151,
    description: "Antigua offers one of the fastest CBI programs in the Caribbean with multiple investment routes including donation, real estate, and business investment.",
    benefits: ["Visa-free travel to 151 countries", "5-day residency requirement only", "Family-friendly program", "No income tax", "Fast processing"],
    requirements: ["Clean criminal record", "Proof of funds", "Health certificate", "5 days residency in 5 years"],
    radarScores: { cost_score: 52, speed_score: 70, lifestyle_score: 62, tax_score: 85, travel_score: 78 },
    excludedNationalities: ["AF", "IR", "KP", "SO", "SD", "YE", "RU", "BY"],
    marketingHook: "Caribbean citizenship with zero income tax, family-friendly pricing, and 150+ visa-free destinations.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇦🇬",
  },
  {
    name: "Argentina Residency",
    slug: "argentina",
    country: "Argentina",
    type: "Residency",
    region: "south_america",
    minInvestment: 0,
    maxInvestment: 50000,
    currency: "USD",
    processingTimeMonths: 2,
    visaFreeCount: 171,
    description: "Argentina offers one of the easiest residency paths in the world with a pathway to citizenship in just 2 years. No investment required.",
    benefits: ["Fast path to citizenship (2 years)", "Low cost of living", "No investment required", "Mercosur access", "Rich culture"],
    requirements: ["Valid passport", "Clean criminal record", "Proof of income", "Health certificate"],
    radarScores: { cost_score: 100, speed_score: 80, lifestyle_score: 55, tax_score: 40, travel_score: 88 },
    excludedNationalities: [],
    marketingHook: "Residency with a path to citizenship in just 2 years  - no investment required.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇦🇷",
    comingSoon: true,
  },
  {
    name: "Chile Residency",
    slug: "chile",
    country: "Chile",
    type: "Residency",
    region: "south_america",
    minInvestment: 500000,
    maxInvestment: 500000,
    currency: "USD",
    processingTimeMonths: 4,
    visaFreeCount: 174,
    description: "Chile provides a stable, modern residency option in South America with a pathway to one of the strongest passports in the region.",
    benefits: ["Strong passport (174 countries)", "Stable economy", "Path to citizenship (5 years)", "Low corruption", "Modern infrastructure"],
    requirements: ["Valid passport", "Clean criminal record", "Proof of income or employment", "Health certificate"],
    radarScores: { cost_score: 38, speed_score: 68, lifestyle_score: 72, tax_score: 38, travel_score: 89 },
    excludedNationalities: [],
    marketingHook: "Stable South American residency with one of the region's strongest passports.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇨🇱",
  },
  {
    name: "Dominica CBI",
    slug: "dominica",
    country: "Dominica",
    type: "CBI",
    region: "caribbean",
    minInvestment: 100000,
    maxInvestment: 200000,
    currency: "USD",
    processingTimeMonths: 4,
    visaFreeCount: 144,
    description: "One of the most affordable CBI programs in the world. Dominica offers citizenship through a $100,000 donation to the Economic Diversification Fund.",
    benefits: ["Visa-free travel to 144 countries", "Most affordable CBI program", "No residency requirement", "Tax-free on foreign income", "Family inclusion"],
    requirements: ["Clean criminal record", "Proof of funds", "Health certificate", "Due diligence clearance"],
    radarScores: { cost_score: 80, speed_score: 70, lifestyle_score: 45, tax_score: 85, travel_score: 74 },
    excludedNationalities: ["AF", "IR", "KP", "SO", "SD", "YE", "RU", "BY"],
    marketingHook: "The most affordable Caribbean citizenship  - full second passport from just $100,000 with no residency required.",
    isActive: true,
    featured: true,
    exclusive: false,
    flagEmoji: "🇩🇲",
  },
  {
    name: "El Salvador Residency",
    slug: "el-salvador",
    country: "El Salvador",
    type: "Residency",
    region: "central_america",
    minInvestment: 1021999,
    maxInvestment: 1021999,
    currency: "USD",
    processingTimeMonths: 2,
    visaFreeCount: 130,
    description: "El Salvador offers fast residency with Bitcoin-friendly policies and a growing freedom-focused community. Territorial tax system.",
    benefits: ["Territorial tax system", "Bitcoin legal tender", "Low cost of living", "Fast processing", "Freedom-oriented community"],
    requirements: ["Valid passport", "Clean criminal record", "Proof of income", "Background check"],
    radarScores: { cost_score: 15, speed_score: 85, lifestyle_score: 40, tax_score: 80, travel_score: 67 },
    excludedNationalities: [],
    marketingHook: "Fast residency with territorial taxation and Bitcoin-friendly policies.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇸🇻",
  },
  {
    name: "Georgia Residency",
    slug: "georgia",
    country: "Georgia",
    type: "Residency",
    region: "europe",
    minInvestment: 0,
    maxInvestment: 100000,
    currency: "USD",
    processingTimeMonths: 1,
    visaFreeCount: 115,
    description: "Georgia offers a remarkably easy residency program with low taxes and a thriving expat community. A favorite for digital nomads and entrepreneurs.",
    benefits: ["1% personal income tax (small business)", "Easy setup", "Low cost of living", "Growing tech hub", "No visa needed for 1 year (many nationalities)"],
    requirements: ["Valid passport", "Proof of income", "Clean criminal record"],
    radarScores: { cost_score: 95, speed_score: 95, lifestyle_score: 62, tax_score: 90, travel_score: 59 },
    excludedNationalities: [],
    marketingHook: "Effortless residency with 1% tax  - Georgia is the digital nomad's gateway to Europe.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇬🇪",
  },
  {
    name: "Asset Protection Trust",
    slug: "asset-protection-trust",
    country: "Global",
    type: "Trust",
    region: "global",
    minInvestment: 50000,
    maxInvestment: 500000,
    currency: "USD",
    processingTimeMonths: 2,
    visaFreeCount: null,
    description: "Offshore asset protection trusts provide a legal framework to shield wealth from lawsuits, creditors, and political instability.",
    benefits: ["Legal asset protection", "Privacy", "Estate planning benefits", "Multi-jurisdictional", "Creditor protection"],
    requirements: ["Legal consultation", "Proof of asset ownership", "KYC documentation"],
    radarScores: { cost_score: 70, speed_score: 85, lifestyle_score: 0, tax_score: 65, travel_score: 0 },
    excludedNationalities: [],
    marketingHook: "Shield your wealth with offshore asset protection  - legal, private, multi-jurisdictional.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🛡️",
  },  {
    name: "Greece Golden Visa",
    slug: "greece",
    country: "Greece",
    type: "Golden Visa",
    region: "europe",
    minInvestment: 250000,
    maxInvestment: 500000,
    currency: "EUR",
    processingTimeMonths: 5,
    visaFreeCount: 188,
    description: "Greece offers one of Europe's most affordable Golden Visa programs through real estate investment, with full Schengen area access.",
    benefits: ["EU residency", "Schengen area access", "Real estate investment", "No minimum stay", "Path to citizenship (7 years)"],
    requirements: ["Real estate investment", "Clean criminal record", "Health insurance", "Proof of funds"],
    radarScores: { cost_score: 50, speed_score: 58, lifestyle_score: 82, tax_score: 40, travel_score: 92 },
    excludedNationalities: ["AF", "KP", "IR", "SY"],
    marketingHook: "EU residency through Mediterranean real estate  - Schengen access, no minimum stay.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇬🇷",
  },
  {
    name: "Grenada CBI",
    slug: "grenada",
    country: "Grenada",
    type: "CBI",
    region: "caribbean",
    minInvestment: 275000,
    maxInvestment: 350000,
    currency: "USD",
    processingTimeMonths: 5,
    visaFreeCount: 148,
    description: "Grenada's CBI provides access to the US E-2 Treaty Investor Visa, making it uniquely attractive for those seeking US market access alongside Caribbean citizenship.",
    benefits: ["US E-2 Treaty Visa eligibility", "Visa-free travel to 148 countries", "No residency requirement", "Tax advantages", "China visa-free"],
    requirements: ["Clean criminal record", "Proof of funds", "Health certificate", "Due diligence clearance"],
    radarScores: { cost_score: 60, speed_score: 58, lifestyle_score: 58, tax_score: 85, travel_score: 73 },
    excludedNationalities: ["IR", "KP", "RU", "BY"],
    marketingHook: "The only Caribbean passport with US E-2 Treaty Visa access  - Grenada citizenship opens doors to both Caribbean and American markets.",
    isActive: true,
    featured: true,
    exclusive: false,
    flagEmoji: "🇬🇩",
  },
  {
    name: "Panama Residency",
    slug: "panama",
    country: "Panama",
    type: "Residency",
    region: "central_america",
    minInvestment: 300000,
    maxInvestment: 300000,
    currency: "USD",
    processingTimeMonths: 6,
    visaFreeCount: 142,
    description: "Panama offers multiple residency options including the popular Friendly Nations Visa and Pensionado programme. A strategic hub connecting North and South America with a territorial tax system.",
    benefits: ["Territorial tax system", "Friendly Nations Visa available", "USD-based economy", "Strategic global hub", "Path to citizenship (5 years)", "No worldwide income tax"],
    requirements: ["Valid passport", "Clean criminal record", "Proof of economic ties or income", "Health certificate", "Bank reference letter"],
    radarScores: { cost_score: 55, speed_score: 50, lifestyle_score: 70, tax_score: 85, travel_score: 70 },
    excludedNationalities: [],
    marketingHook: "Panama's territorial tax system and Friendly Nations Visa make it a top-tier residency for global entrepreneurs.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇵🇦",
  },
  {
    name: "Portugal Golden Visa",
    slug: "portugal",
    country: "Portugal",
    type: "Golden Visa",
    region: "europe",
    minInvestment: 500000,
    maxInvestment: 500000,
    currency: "EUR",
    processingTimeMonths: 12,
    visaFreeCount: 191,
    description: "Portugal's Golden Visa is one of Europe's premier residency programs, offering a path to EU citizenship with minimal stay requirements.",
    benefits: ["EU residency & path to citizenship", "Schengen area access", "Minimal stay requirement (7 days/year)", "Family inclusion", "Strong passport (191 countries)"],
    requirements: ["Qualifying investment (fund or business)", "Clean criminal record", "Health insurance", "Proof of funds"],
    radarScores: { cost_score: 50, speed_score: 35, lifestyle_score: 88, tax_score: 45, travel_score: 95 },
    excludedNationalities: ["AF", "KP", "IR", "SY"],
    marketingHook: "Your EU gateway  - residency in Portugal with just 7 days a year and a path to one of the world's strongest passports.",
    isActive: true,
    featured: true,
    exclusive: false,
    flagEmoji: "🇵🇹",
  },
  {
    name: "Sao Tome CBI",
    slug: "sao-tome",
    country: "Sao Tome & Principe",
    type: "CBI",
    region: "africa",
    minInvestment: 105000,
    maxInvestment: 175000,
    currency: "USD",
    processingTimeMonths: 6,
    visaFreeCount: 63,
    description: "Sao Tome & Principe offers one of the most affordable Citizenship by Investment programs in the world, with a contribution to a national development fund.",
    benefits: ["Most affordable CBI globally", "No physical residency required", "Family inclusion", "Lifetime citizenship", "Discreet processing"],
    requirements: ["Clean criminal record", "Proof of funds", "Health certificate", "Due diligence clearance"],
    radarScores: { cost_score: 82, speed_score: 50, lifestyle_score: 38, tax_score: 55, travel_score: 28 },
    excludedNationalities: ["IR", "KP", "RU", "BY"],
    marketingHook: "Sao Tome citizenship from $105,000 — the most accessible CBI route in the market for budget-led applicants.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇸🇹",
  },
  {
    name: "Serbia CBI",
    slug: "serbia",
    country: "Serbia",
    type: "CBI",
    region: "europe",
    minInvestment: 400000,
    maxInvestment: 500000,
    currency: "USD",
    processingTimeMonths: 9,
    visaFreeCount: 136,
    description: "An exclusive European citizenship program available through our partner network. Serbia offers a strategic gateway to Europe with strong passport strength.",
    benefits: ["European citizenship", "Visa-free Schengen access", "EU candidate country", "Strategic location", "Growing economy"],
    requirements: ["Clean criminal record", "Proof of investment", "Health certificate", "Background check"],
    radarScores: { cost_score: 40, speed_score: 35, lifestyle_score: 60, tax_score: 55, travel_score: 67 },
    excludedNationalities: [],
    marketingHook: "European citizenship through an exclusive investment programme  - strategic gateway to the EU.",
    isActive: true,
    featured: true,
    exclusive: true,
    flagEmoji: "🇷🇸",
  },
  {
    name: "Sierra Leone CBI",
    slug: "sierra-leone",
    country: "Sierra Leone",
    type: "CBI",
    region: "africa",
    minInvestment: 115000,
    maxInvestment: 165000,
    currency: "USD",
    processingTimeMonths: 4,
    visaFreeCount: 73,
    description: "Sierra Leone offers a discreet, low-cost Citizenship by Investment route through a contribution to a national development fund, with no physical residency requirement.",
    benefits: ["Low-cost CBI route", "No physical residency required", "Family inclusion", "Lifetime citizenship", "Discreet processing"],
    requirements: ["Clean criminal record", "Proof of funds", "Health certificate", "Due diligence clearance"],
    radarScores: { cost_score: 80, speed_score: 68, lifestyle_score: 35, tax_score: 60, travel_score: 35 },
    excludedNationalities: ["IR", "KP", "RU", "BY"],
    marketingHook: "Sierra Leone citizenship from $115,000 — a low-profile route for applicants who value discretion and price.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇸🇱",
  },
  {
    name: "Slovakia Residency",
    slug: "slovakia",
    country: "Slovakia",
    type: "Residency",
    region: "europe",
    minInvestment: 5000,
    maxInvestment: 50000,
    currency: "EUR",
    processingTimeMonths: 3,
    visaFreeCount: 183,
    description: "Slovakia offers EU residency through business establishment, providing access to the entire European Union market and Schengen area.",
    benefits: ["EU residency", "Schengen area access", "Low setup costs", "Path to EU citizenship", "Central European location"],
    requirements: ["Business establishment", "Clean criminal record", "Proof of accommodation", "Health insurance"],
    radarScores: { cost_score: 95, speed_score: 78, lifestyle_score: 72, tax_score: 38, travel_score: 90 },
    excludedNationalities: [],
    marketingHook: "EU residency from just $5,000 through business establishment  - Schengen access included.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇸🇰",
  },
  {
    name: "St Kitts & Nevis CBI",
    slug: "st-kitts-and-nevis",
    country: "St Kitts & Nevis",
    type: "CBI",
    region: "caribbean",
    minInvestment: 300000,
    maxInvestment: 400000,
    currency: "USD",
    processingTimeMonths: 4,
    visaFreeCount: 156,
    description: "The world's oldest and most reputable Citizenship by Investment program. Gain visa-free access to 150+ countries with a donation from $250,000 or real estate from $400,000.",
    benefits: ["Visa-free travel to 156 countries", "No residency requirement", "Includes dependents", "Tax-friendly jurisdiction", "Dual citizenship allowed"],
    requirements: ["Clean criminal record", "Proof of funds", "Health certificate", "Due diligence clearance"],
    radarScores: { cost_score: 55, speed_score: 68, lifestyle_score: 62, tax_score: 85, travel_score: 82 },
    excludedNationalities: ["AF", "IR", "KP", "SO", "SD", "YE", "RU", "BY"],
    marketingHook: "The world's oldest and most trusted CBI programme  - Caribbean citizenship with visa-free access to 156 countries.",
    isActive: true,
    featured: true,
    exclusive: false,
    flagEmoji: "🇰🇳",
  },
  {
    name: "St Lucia CBI",
    slug: "st-lucia",
    country: "St Lucia",
    type: "CBI",
    region: "caribbean",
    minInvestment: 100000,
    maxInvestment: 300000,
    currency: "USD",
    processingTimeMonths: 4,
    visaFreeCount: 146,
    description: "St Lucia's CBI program offers competitive pricing and multiple investment options, including government bonds and real estate investment.",
    benefits: ["Visa-free travel to 146 countries", "Multiple investment options", "No residency requirement", "Tax incentives", "Family inclusion"],
    requirements: ["Clean criminal record", "Proof of funds", "Health certificate", "Due diligence clearance"],
    radarScores: { cost_score: 78, speed_score: 68, lifestyle_score: 58, tax_score: 85, travel_score: 72 },
    excludedNationalities: ["IR", "KP", "RU", "BY"],
    marketingHook: "St Lucia citizenship from $100,000  - one of the Caribbean's best-value passports with multiple investment routes.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇱🇨",
  },
  {
    name: "Dubai Residency",
    slug: "dubai",
    country: "UAE",
    type: "Residency",
    region: "middle_east",
    minInvestment: 100000,
    maxInvestment: 550000,
    currency: "AED",
    processingTimeMonths: 2,
    visaFreeCount: 183,
    description: "Dubai offers world-class residency options through business setup or property investment, with zero income tax and a luxury lifestyle.",
    benefits: ["0% income tax", "World-class infrastructure", "Strategic global location", "Multiple visa options", "Golden Visa available"],
    requirements: ["Business license or property investment", "Health insurance", "Clean criminal record", "Proof of funds"],
    radarScores: { cost_score: 80, speed_score: 85, lifestyle_score: 92, tax_score: 100, travel_score: 90 },
    excludedNationalities: ["KP", "IR", "SY"],
    marketingHook: "Zero income tax, world-class lifestyle  - Dubai's Golden Visa is the ultimate base for global entrepreneurs.",
    isActive: true,
    featured: true,
    exclusive: false,
    flagEmoji: "🇦🇪",
  },
  {
    name: "Vanuatu CBI",
    slug: "vanuatu",
    country: "Vanuatu",
    type: "CBI",
    region: "asia_pacific",
    minInvestment: 150000,
    maxInvestment: 220000,
    currency: "USD",
    processingTimeMonths: 2,
    visaFreeCount: 96,
    description: "Vanuatu's Development Support Program is the fastest CBI globally, typically processing applications in 1–2 months with no residency requirement and a single donation route.",
    benefits: ["Fastest CBI globally (1–2 months)", "No residency requirement", "Zero income, capital gains, or inheritance tax", "Remote application", "Family inclusion"],
    requirements: ["Clean criminal record", "Proof of funds", "Health certificate", "Due diligence clearance"],
    radarScores: { cost_score: 75, speed_score: 95, lifestyle_score: 45, tax_score: 95, travel_score: 48 },
    excludedNationalities: ["IR", "KP", "RU", "BY", "SY", "YE"],
    marketingHook: "Vanuatu citizenship in as little as 1–2 months — the fastest CBI on the market and a zero-tax jurisdiction.",
    isActive: true,
    featured: false,
    exclusive: false,
    flagEmoji: "🇻🇺",
  },

];

export const TESTIMONIALS = [
  {
    name: "James K.",
    role: "Tech Entrepreneur",
    quote: "Concierge made the entire citizenship process seamless. From initial consultation to receiving my passport, every step was handled with professionalism.",
    program: "St Kitts & Nevis CBI",
  },
  {
    name: "Sarah M.",
    role: "Investment Director",
    quote: "The qualification tool matched me with the perfect programme for my family. Their advisory team's expertise in European Golden Visas is unmatched.",
    program: "Portugal Golden Visa",
  },
  {
    name: "Ahmed R.",
    role: "Business Owner",
    quote: "Setting up in Dubai through Concierge was the best business decision I've made. Zero tax and world-class infrastructure  - exactly what I needed.",
    program: "Dubai Residency",
  },
];

export const FAQ_ITEMS = [
  {
    question: "What is Citizenship by Investment (CBI)?",
    answer: "CBI programmes allow individuals to obtain citizenship of a country by making a qualifying economic contribution, typically through a government donation, real estate purchase, or business investment. The process is legal, government-approved, and typically takes 3-12 months.",
  },
  {
    question: "How much does a second passport cost?",
    answer: "Costs vary significantly by programme. Caribbean CBI programmes start from $100,000 (Dominica), while European options like Portugal's Golden Visa begin at $250,000. Our qualification tool will match you with programmes within your budget.",
  },
  {
    question: "Do I need to live in the country?",
    answer: "Most CBI and Golden Visa programmes have minimal or no physical residency requirements. For example, Caribbean CBI programmes require no residency at all, while Portugal's Golden Visa requires just 7 days per year.",
  },
  {
    question: "Can my family be included?",
    answer: "Yes, nearly all programmes include your spouse and dependent children. Many Caribbean programmes also allow parents and grandparents over 55 to be included as dependents.",
  },
  {
    question: "Is dual citizenship legal?",
    answer: "Dual citizenship is permitted by most countries. All programmes we offer allow you to maintain your existing citizenship. However, some countries (like China and India) do not permit dual nationality  - we'll advise you on any implications.",
  },
  {
    question: "How long does the process take?",
    answer: "Processing times range from 1-2 months (Vanuatu, Georgia) to 6-12 months (Portugal, Malta). Caribbean CBI programmes typically process in 3-6 months. We'll give you a realistic timeline during your consultation.",
  },
];

/**
 * Long-form guide content layered on top of a programme page. ADDITIVE: the
 * existing ProgramDetail layout is untouched. Only programmes with an entry in
 * PROGRAMME_GUIDES render the extra guide block, so this affects Portugal only
 * until more entries are added.
 *
 * Fields marked [PLACEHOLDER] / [VERIFY] need real input before publishing:
 *  - author: a real, credentialed advisor (YMYL E-E-A-T requirement)
 *  - costs + investment routes: verified current figures and rules
 *  - sources: official government links
 */
export interface ProgrammeGuide {
  whoItSuits: string[];
  investmentRoutes: { name: string; detail: string }[];
  taxNote: string;
  faqs: { q: string; a: string }[];
  author: { name: string; title: string };
  sources: { label: string; url: string }[];
  lastReviewed: string;
}

export const PROGRAMME_GUIDES: Record<string, ProgrammeGuide> = {
  portugal: {
    whoItSuits: [
      "Investors who want EU access without relocating: the stay requirement is roughly 7 days a year.",
      "Families seeking a route to EU citizenship over time, with a spouse and dependent children included.",
      "Frequent travellers who value one of the world's strongest passports (191 visa-free destinations).",
    ],
    investmentRoutes: [
      {
        name: "Qualifying investment fund",
        detail:
          "From EUR 500,000 into an approved fund. [VERIFY current AIMA-approved fund rules before publishing.]",
      },
      {
        name: "Business / job creation",
        detail:
          "Capital transfer or company investment that creates jobs. [VERIFY current thresholds.]",
      },
      {
        name: "Residential real estate",
        detail:
          "CLOSED. Portugal removed the residential real-estate route in 2023. Listed only to pre-empt the common, now-outdated question.",
      },
    ],
    taxNote:
      "A Portuguese residency permit does not by itself change your tax residency, and obtaining it does not automatically create a Portuguese tax liability. Your position depends on where you are tax-resident and how much time you spend in Portugal. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Portugal?",
        a: "No. The Golden Visa has a minimal stay requirement of around 7 days per year, which is one of its main attractions.",
      },
      {
        q: "Can I include my family?",
        a: "Yes. A spouse and dependent children can be included, and in many cases dependent parents.",
      },
      {
        q: "How long until citizenship?",
        a: "Residency is the first step. Citizenship by naturalisation becomes possible after meeting the residency and language conditions over several years. [VERIFY current naturalisation timeline.]",
      },
      {
        q: "Which investment routes are open now?",
        a: "The fund and business routes are the active options. The residential real-estate route was removed in 2023. We confirm the current rules for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official AIMA / Portugal immigration source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  "antigua-and-barbuda": {
    whoItSuits: [
      "Families who want a second passport quickly, with a presence requirement of only around 5 days across the first 5 years.",
      "Travellers who value visa-free or visa-on-arrival access to roughly 151 destinations, including the UK and the Schengen area.",
      "Applicants who want a tax-friendly base with no tax on worldwide income for those who are not tax-resident there.",
    ],
    investmentRoutes: [
      {
        name: "National Development Fund donation",
        detail:
          "A one-time, non-refundable contribution to the government fund. The lowest entry point for a single applicant. [VERIFY current minimum and family-size bands.]",
      },
      {
        name: "University of the West Indies Fund",
        detail:
          "A contribution route geared to larger families, funding a UWI scholarship place. [VERIFY current family-size threshold and amount.]",
      },
      {
        name: "Approved real estate",
        detail:
          "Purchase in a government-approved development, held for a minimum period before resale. [VERIFY current minimum value and holding period.]",
      },
      {
        name: "Business investment",
        detail:
          "A qualifying investment into an approved business, made alone or jointly. [VERIFY current minimum and approval criteria.]",
      },
    ],
    taxNote:
      "Antigua & Barbuda does not tax worldwide income, capital gains or inheritance for individuals who are not tax-resident there, and holding the passport does not by itself make you tax-resident. Your position depends on where you actually live and are taxed. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Antigua?",
        a: "No. The only presence requirement is around 5 days within the first 5 years of holding citizenship.",
      },
      {
        q: "Can I include my family?",
        a: "Yes. A spouse and dependent children can be included, and in many cases dependent parents and siblings. [VERIFY current dependant rules.]",
      },
      {
        q: "How strong is the passport?",
        a: "It gives visa-free or visa-on-arrival access to roughly 151 countries, including the UK and the Schengen area. [VERIFY current count.]",
      },
      {
        q: "Which investment routes are open now?",
        a: "The development-fund donation, the university fund for larger families, approved real estate and business investment. We confirm current thresholds for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official Antigua CIU source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  chile: {
    whoItSuits: [
      "Applicants who want a stable South American base with one of the region's strongest passports, around 174 destinations.",
      "Professionals and entrepreneurs with a qualifying job offer, business activity or investment in Chile.",
      "Families looking for a longer-term path to permanent residency and, eventually, citizenship.",
    ],
    investmentRoutes: [
      {
        name: "Investment residency",
        detail:
          "Temporary residency tied to a qualifying business activity or investment in Chile, progressing to permanent residency over time. [VERIFY current category names and any minimum investment under the latest migration law.]",
      },
      {
        name: "Professional or work residency",
        detail:
          "Residency for applicants with a qualifying job offer or professional activity in Chile. [VERIFY current category and eligibility.]",
      },
    ],
    taxNote:
      "A Chilean residency permit does not by itself fix your tax residency, which generally follows from how much time you spend in the country. Chile taxes residents on worldwide income after an initial period. Your position depends on your circumstances, and we coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Chile?",
        a: "Residency routes generally expect genuine ties and presence, and the path to permanent residency and citizenship is based on time spent in the country. [VERIFY current physical-presence rules.]",
      },
      {
        q: "Can I include my family?",
        a: "Yes. Spouses and dependent children are typically included on family residency applications. [VERIFY current dependant rules.]",
      },
      {
        q: "How long until citizenship?",
        a: "Citizenship by naturalisation becomes possible after a qualifying period of permanent residency. [VERIFY current naturalisation timeline.]",
      },
      {
        q: "Which routes are available?",
        a: "Investment, business and professional or work-based residency are the main paths. We confirm the current categories and any thresholds for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official Chile migration source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  dominica: {
    whoItSuits: [
      "Budget-led applicants who want a full second passport without relocating: there is no residency requirement.",
      "Travellers who value visa-free or visa-on-arrival access to roughly 144 destinations, including the UK and the Schengen area.",
      "Families wanting an affordable, tax-friendly second citizenship that can be passed to future generations.",
    ],
    investmentRoutes: [
      {
        name: "Economic Diversification Fund donation",
        detail:
          "A one-time contribution to the national fund. The most affordable single-applicant route in the programme. [VERIFY current minimum and family bands.]",
      },
      {
        name: "Approved real estate",
        detail:
          "Purchase in a government-approved development, held for a minimum period before resale. [VERIFY current minimum value and holding period.]",
      },
    ],
    taxNote:
      "Dominica does not tax foreign income, capital gains or inheritance for individuals who are not tax-resident there, and holding the passport does not by itself create a Dominican tax liability. Your position depends on where you actually live and are taxed. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Dominica?",
        a: "No. There is no residency or physical-presence requirement to obtain or keep the citizenship.",
      },
      {
        q: "Can I include my family?",
        a: "Yes. A spouse, dependent children and, in many cases, dependent parents can be included. [VERIFY current dependant rules.]",
      },
      {
        q: "How strong is the passport?",
        a: "It gives visa-free or visa-on-arrival access to roughly 144 countries, including the UK and the Schengen area. [VERIFY current count.]",
      },
      {
        q: "Which investment routes are open now?",
        a: "The Economic Diversification Fund donation and approved real estate. We confirm current thresholds for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official Dominica CBIU source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  "el-salvador": {
    whoItSuits: [
      "Applicants who want fast residency, typically in around 2 months, with a freedom-oriented and Bitcoin-friendly community.",
      "Investors comfortable holding or contributing digital assets as part of a qualifying programme.",
      "Those drawn to a broadly territorial tax system and a low cost of living.",
    ],
    investmentRoutes: [
      {
        name: "Investment residency (Freedom Visa)",
        detail:
          "Residency tied to a qualifying contribution to the country, accepted in Bitcoin or USDT under the Freedom Visa programme. [VERIFY current amount and accepted asset types.]",
      },
    ],
    taxNote:
      "El Salvador operates a broadly territorial tax system and treats Bitcoin as legal tender, with gains on Bitcoin not taxed locally. [VERIFY current rules.] Your wider position depends on where you are tax-resident, and we coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in El Salvador?",
        a: "Physical-presence expectations are light compared with most residency programmes, though genuine ties matter for renewal and any later citizenship. [VERIFY current presence rules.]",
      },
      {
        q: "Can I include my family?",
        a: "Yes. Spouses and dependent children are typically included. [VERIFY current dependant rules.]",
      },
      {
        q: "Can I pay in Bitcoin?",
        a: "The Freedom Visa programme is designed around digital-asset contributions, accepted in Bitcoin or USDT. [VERIFY current accepted assets and amounts.]",
      },
      {
        q: "How fast is processing?",
        a: "Processing is fast by global standards, often around 2 months. We confirm the current timeline for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official El Salvador programme source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  georgia: {
    whoItSuits: [
      "Entrepreneurs and digital nomads who want an easy, low-tax base, including a 1% turnover regime for qualifying small businesses.",
      "Applicants who value fast setup, often around 1 month, and a growing tech and expat community.",
      "Those wanting a low-cost European gateway without heavy presence requirements.",
    ],
    investmentRoutes: [
      {
        name: "Property ownership",
        detail:
          "Residency linked to owning Georgian real estate at or above the qualifying value. [VERIFY current property threshold.]",
      },
      {
        name: "Investment residency",
        detail:
          "A larger qualifying investment route that can lead to permanent residency more quickly. [VERIFY current minimum.]",
      },
      {
        name: "Work or business activity",
        detail:
          "Residency tied to employment or running a registered Georgian business. [VERIFY current criteria.]",
      },
    ],
    taxNote:
      "Georgia offers a low-tax environment, including a 1% turnover regime for qualifying small businesses, and taxes individuals broadly on a territorial basis. [VERIFY current rules.] Your overall position depends on your circumstances, and we coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Georgia?",
        a: "Many nationalities can stay visa-free for up to a year, and residency itself carries light presence expectations, though genuine ties help with renewal. [VERIFY current presence rules.]",
      },
      {
        q: "Can I include my family?",
        a: "Yes. Spouses and dependent children are typically included on family applications. [VERIFY current dependant rules.]",
      },
      {
        q: "How does the 1% tax work?",
        a: "Qualifying small-business owners registered under the small-business status pay tax at a low turnover rate. [VERIFY current eligibility and rate.]",
      },
      {
        q: "Which routes are available?",
        a: "Property ownership, investment and work or business residency. We confirm the current thresholds for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official Georgia immigration source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  greece: {
    whoItSuits: [
      "Investors who want EU residency and Schengen access through Mediterranean real estate, with no minimum-stay requirement.",
      "Families seeking a long-term European base with a path to citizenship over time.",
      "Travellers who value strong mobility, around 188 destinations, alongside a lifestyle relocation option.",
    ],
    investmentRoutes: [
      {
        name: "Real estate",
        detail:
          "Purchase of qualifying property, with the minimum value depending on the location and property type. The primary route. [VERIFY current tiered thresholds by zone.]",
      },
      {
        name: "Capital alternatives",
        detail:
          "Bank deposit, government bonds or other approved financial investments offered alongside real estate. [VERIFY which capital routes are currently open and their minimums.]",
      },
    ],
    taxNote:
      "A Greek Golden Visa is a residency permit and does not by itself change your tax residency or create a Greek tax liability. Your position depends on where you are tax-resident and how much time you spend in Greece. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Greece?",
        a: "No. There is no minimum stay required to maintain the residency permit, which is one of its main attractions.",
      },
      {
        q: "Can I include my family?",
        a: "Yes. A spouse, dependent children and, in many cases, dependent parents of both spouses can be included. [VERIFY current dependant rules.]",
      },
      {
        q: "How long until citizenship?",
        a: "Residency is the first step. Citizenship by naturalisation becomes possible after meeting residence and language conditions over several years. [VERIFY current timeline.]",
      },
      {
        q: "Which investment routes are open now?",
        a: "Qualifying real estate is the primary route, with capital alternatives offered alongside it. We confirm the current tiered thresholds for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official Greece Golden Visa source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  grenada: {
    whoItSuits: [
      "Applicants who want US market access: Grenada is the only Caribbean citizenship eligible for the US E-2 Treaty Investor Visa.",
      "Travellers who value visa-free or visa-on-arrival access to roughly 148 destinations, including China.",
      "Families wanting a tax-friendly second passport with no residency requirement.",
    ],
    investmentRoutes: [
      {
        name: "National Transformation Fund donation",
        detail:
          "A one-time contribution to the government fund. The most direct single-applicant route. [VERIFY current minimum and family bands.]",
      },
      {
        name: "Approved real estate",
        detail:
          "Purchase in an approved tourism development, held for a minimum period before resale. [VERIFY current minimum value and holding period.]",
      },
    ],
    taxNote:
      "Grenada does not tax worldwide income, capital gains or inheritance for individuals who are not tax-resident there, and holding the passport does not by itself make you tax-resident. Your position depends on where you actually live and are taxed. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Grenada?",
        a: "No. There is no residency or physical-presence requirement to obtain or keep the citizenship.",
      },
      {
        q: "What is the US E-2 advantage?",
        a: "Grenada citizens can apply for the US E-2 Treaty Investor Visa, which allows living and running a business in the United States. Grenada is the only Caribbean CBI with this treaty. [VERIFY current treaty status and E-2 conditions.]",
      },
      {
        q: "Can I include my family?",
        a: "Yes. A spouse, dependent children, dependent parents and, in many cases, siblings can be included. [VERIFY current dependant rules.]",
      },
      {
        q: "Which investment routes are open now?",
        a: "The National Transformation Fund donation and approved real estate. We confirm current thresholds for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official Grenada CBI source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  panama: {
    whoItSuits: [
      "Entrepreneurs who want a territorial-tax base and a strategic hub connecting North and South America.",
      "Nationals of qualifying countries who can use the Friendly Nations Visa via economic ties.",
      "Retirees with a qualifying lifetime pension looking at the well-known Pensionado programme.",
    ],
    investmentRoutes: [
      {
        name: "Friendly Nations Visa",
        detail:
          "Residency for nationals of qualifying countries via economic ties such as property, a fixed deposit or local employment. [VERIFY current qualifying-country list and economic-tie thresholds.]",
      },
      {
        name: "Qualified Investor Visa",
        detail:
          "Faster residency via a larger qualifying investment in real estate, a fixed-term bank deposit or the securities market. [VERIFY current minimums by sub-route.]",
      },
      {
        name: "Pensionado (retiree)",
        detail:
          "Residency for applicants with a qualifying lifetime pension, with no investment route. [VERIFY current minimum monthly pension.]",
      },
    ],
    taxNote:
      "Panama operates a territorial tax system, so foreign-source income is generally outside the Panamanian tax net. Your worldwide position still depends on your other residencies and where you spend time. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Panama?",
        a: "Presence expectations are light for most routes, though keeping ties supports renewal and the path to permanent residency and citizenship. [VERIFY current presence rules.]",
      },
      {
        q: "Can I include my family?",
        a: "Yes. Spouses and dependent children are typically included, with dependent parents possible in some cases. [VERIFY current dependant rules.]",
      },
      {
        q: "How long until citizenship?",
        a: "Citizenship by naturalisation generally becomes possible after about 5 years of residency, subject to conditions. [VERIFY current timeline.]",
      },
      {
        q: "Which routes are available?",
        a: "The Friendly Nations Visa, the Qualified Investor Visa and the Pensionado programme. We confirm the current thresholds for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official Panama immigration source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  "sao-tome": {
    whoItSuits: [
      "Budget-led applicants who want one of the most affordable second citizenships in the market, with no physical residency required.",
      "Families wanting lifetime citizenship that can be included for a spouse and dependants.",
      "Those who value discreet processing and a single, straightforward contribution route.",
    ],
    investmentRoutes: [
      {
        name: "National development fund contribution",
        detail:
          "A one-time donation to a government development fund. The single qualifying route and one of the lowest entry points in the market. [VERIFY current minimum, family bands and that the programme is currently accepting applications.]",
      },
    ],
    taxNote:
      "Holding citizenship of Sao Tome & Principe does not by itself make you tax-resident there, and there is no physical-presence requirement. Your tax position depends on where you actually live. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Sao Tome?",
        a: "No. There is no physical residency requirement to obtain or keep the citizenship.",
      },
      {
        q: "Can I include my family?",
        a: "Yes. A spouse and dependent children can be included. [VERIFY current dependant rules.]",
      },
      {
        q: "How strong is the passport?",
        a: "Visa-free access is more limited than the established Caribbean programmes, at roughly 63 destinations, so it suits budget and optionality goals more than mobility. [VERIFY current count.]",
      },
      {
        q: "Which route is available?",
        a: "A single contribution to the national development fund. We confirm the current minimum and that the programme is active for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official Sao Tome programme source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  serbia: {
    whoItSuits: [
      "Applicants seeking a European citizenship as a strategic gateway, available through an exclusive partner arrangement.",
      "Clients who want a Schengen-access bridge alongside a longer EU residency or citizenship plan.",
      "Those comfortable with a route confirmed case by case rather than a standard published programme.",
    ],
    investmentRoutes: [
      {
        name: "Investment route via partner network",
        detail:
          "Serbia is offered through an exclusive partner arrangement rather than a standard published citizenship-by-investment programme. The qualifying structure and amount are confirmed case by case. [VERIFY exact route, legal basis and current availability before quoting anything to a client.]",
      },
    ],
    taxNote:
      "Serbian citizenship does not by itself make you tax-resident in Serbia, which depends on where you actually live and spend time. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "How does the Serbia route work?",
        a: "It is offered through an exclusive partner network rather than a standard programme, so the structure is confirmed individually. We walk you through the current route at qualification. [VERIFY current mechanism.]",
      },
      {
        q: "Does it give Schengen access?",
        a: "Serbia is an EU candidate country and its passport offers strong regional mobility, which can serve as a bridge during a longer EU plan. [VERIFY current visa-free and Schengen position.]",
      },
      {
        q: "Can I include my family?",
        a: "Family inclusion is typically possible. We confirm the current dependant rules with our partner for your case. [VERIFY current dependant rules.]",
      },
      {
        q: "How long does it take?",
        a: "Timelines are longer than the Caribbean programmes, around 9 months in our experience, and depend on the specific structure. We confirm the current timeline for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: partner / official Serbia source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  "sierra-leone": {
    whoItSuits: [
      "Budget-led applicants who want a low-cost second citizenship with no physical residency requirement.",
      "Those who value discretion and a straightforward contribution route.",
      "Families wanting lifetime citizenship that can include a spouse and dependants.",
    ],
    investmentRoutes: [
      {
        name: "National development fund contribution",
        detail:
          "A one-time donation to a government development fund. A low-cost single route with no residency requirement. [VERIFY current minimum, family bands and that the programme is currently accepting applications.]",
      },
    ],
    taxNote:
      "Holding citizenship of Sierra Leone does not by itself make you tax-resident there, and there is no physical-presence requirement. Your tax position depends on where you actually live. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Sierra Leone?",
        a: "No. There is no physical residency requirement to obtain or keep the citizenship.",
      },
      {
        q: "Can I include my family?",
        a: "Yes. A spouse and dependent children can be included. [VERIFY current dependant rules.]",
      },
      {
        q: "How strong is the passport?",
        a: "Visa-free access is more limited than the established Caribbean programmes, at roughly 73 destinations, so it suits budget and optionality goals more than mobility. [VERIFY current count.]",
      },
      {
        q: "Which route is available?",
        a: "A single contribution to the national development fund. We confirm the current minimum and that the programme is active for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official Sierra Leone programme source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  slovakia: {
    whoItSuits: [
      "Entrepreneurs who want EU residency and Schengen access through a genuine Slovak business, at a low setup cost.",
      "Those wanting a central European base with a long-term path to EU citizenship.",
      "Applicants comfortable running real business activity to support the permit.",
    ],
    investmentRoutes: [
      {
        name: "Business establishment",
        detail:
          "EU residency through forming and running a Slovak company, with the permit tied to genuine business activity rather than a passive investment. [VERIFY current capital, substance and renewal requirements.]",
      },
    ],
    taxNote:
      "A Slovak residency permit does not by itself change your tax residency, which depends on where you actually live and spend time. EU residency and Schengen access follow from the permit. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Slovakia?",
        a: "The permit is tied to genuine business activity, and renewal and the path to permanent residency depend on real substance and presence. [VERIFY current presence rules.]",
      },
      {
        q: "Can I include my family?",
        a: "Yes. Spouses and dependent children can generally join under family reunification. [VERIFY current dependant rules.]",
      },
      {
        q: "Does it give Schengen access?",
        a: "Yes. A Slovak residency permit provides access to the Schengen area on the standard terms for residents. [VERIFY current rules.]",
      },
      {
        q: "How does the route work?",
        a: "You establish and operate a Slovak company, and the residency permit is granted on the basis of that business activity. We confirm the current requirements for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official Slovakia immigration source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  "st-kitts-and-nevis": {
    whoItSuits: [
      "Applicants who want the oldest and most established CBI programme, with no residency requirement.",
      "Travellers who value visa-free or visa-on-arrival access to roughly 156 destinations, including the UK and the Schengen area.",
      "Families wanting a reputable, tax-friendly second passport that includes dependants.",
    ],
    investmentRoutes: [
      {
        name: "Sustainable Island State Contribution",
        detail:
          "A one-time donation to the government fund. The primary single-applicant route. [VERIFY current minimum and family bands.]",
      },
      {
        name: "Approved real estate",
        detail:
          "Purchase in an approved development or an approved private home, held for a minimum period before resale. [VERIFY current minimum value and holding period.]",
      },
    ],
    taxNote:
      "St Kitts & Nevis does not tax worldwide income, capital gains or inheritance for individuals who are not tax-resident there, and holding the passport does not by itself make you tax-resident. Your position depends on where you actually live and are taxed. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in St Kitts & Nevis?",
        a: "No. There is no residency or physical-presence requirement to obtain or keep the citizenship.",
      },
      {
        q: "Can I include my family?",
        a: "Yes. A spouse, dependent children and, in many cases, dependent parents and siblings can be included. [VERIFY current dependant rules.]",
      },
      {
        q: "How strong is the passport?",
        a: "It gives visa-free or visa-on-arrival access to roughly 156 countries, including the UK and the Schengen area. [VERIFY current count.]",
      },
      {
        q: "Which investment routes are open now?",
        a: "The Sustainable Island State Contribution and approved real estate. We confirm current thresholds for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official St Kitts & Nevis CIU source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  "st-lucia": {
    whoItSuits: [
      "Applicants who want a best-value Caribbean passport with a choice of investment routes and no residency requirement.",
      "Travellers who value visa-free or visa-on-arrival access to roughly 146 destinations, including the UK and the Schengen area.",
      "Families wanting a tax-friendly second citizenship that includes dependants.",
    ],
    investmentRoutes: [
      {
        name: "National Economic Fund donation",
        detail:
          "A one-time contribution to the government fund. The most direct single-applicant route. [VERIFY current minimum and family bands.]",
      },
      {
        name: "Approved real estate",
        detail:
          "Purchase in an approved development, held for a minimum period before resale. [VERIFY current minimum value and holding period.]",
      },
      {
        name: "Government bonds",
        detail:
          "Purchase of non-interest-bearing government bonds, held for a set term. [VERIFY current minimum, term and whether this route is currently open.]",
      },
      {
        name: "Enterprise project",
        detail:
          "An approved business investment, made alone or jointly. [VERIFY current minimum and approval criteria.]",
      },
    ],
    taxNote:
      "St Lucia does not tax worldwide income, capital gains or inheritance for individuals who are not tax-resident there, and holding the passport does not by itself make you tax-resident. Your position depends on where you actually live and are taxed. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in St Lucia?",
        a: "No. There is no residency or physical-presence requirement to obtain or keep the citizenship.",
      },
      {
        q: "Can I include my family?",
        a: "Yes. A spouse, dependent children and, in many cases, dependent parents and siblings can be included. [VERIFY current dependant rules.]",
      },
      {
        q: "How strong is the passport?",
        a: "It gives visa-free or visa-on-arrival access to roughly 146 countries, including the UK and the Schengen area. [VERIFY current count.]",
      },
      {
        q: "Which investment routes are open now?",
        a: "The National Economic Fund donation, approved real estate, government bonds and an enterprise project. We confirm which routes are currently open and their thresholds for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official St Lucia CIU source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  dubai: {
    whoItSuits: [
      "Entrepreneurs and investors who want a zero-income-tax base with world-class infrastructure and a strategic global location.",
      "Property buyers who want a long-term, renewable residency tied to UAE real estate.",
      "Families seeking a secure, well-connected home base with strong mobility, around 183 destinations.",
    ],
    investmentRoutes: [
      {
        name: "Property investment",
        detail:
          "Purchase of qualifying UAE real estate at or above the Golden Visa threshold secures a long-term, renewable residency. [VERIFY current property threshold and visa length.]",
      },
      {
        name: "Business or company setup",
        detail:
          "Establishing or investing in a UAE company, mainland or free zone, supports a residency visa for owners and, in some cases, family and staff. [VERIFY current capital and structure requirements.]",
      },
      {
        name: "Talent and specialist categories",
        detail:
          "Additional Golden Visa categories exist for specified professionals, investors and exceptional talent. [VERIFY current eligibility categories.]",
      },
    ],
    taxNote:
      "The UAE levies no personal income tax, which is a common reason to base in Dubai. A corporate tax now applies to certain business profits, and your overall position still depends on where you are tax-resident. [VERIFY current corporate-tax rules.] We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Dubai?",
        a: "Long-term residency visas carry presence expectations to keep them valid, though these are lighter than full relocation in some categories. [VERIFY current minimum-presence rules to maintain the visa.]",
      },
      {
        q: "Is income really tax-free?",
        a: "The UAE has no personal income tax. A corporate tax applies to certain business profits, so company structures need planning. [VERIFY current rules.]",
      },
      {
        q: "Can I include my family?",
        a: "Yes. Spouses, dependent children and, in some cases, parents and domestic staff can be sponsored. [VERIFY current dependant rules.]",
      },
      {
        q: "Which routes are available?",
        a: "Qualifying property investment, business or company setup, and talent or specialist categories. We confirm the current thresholds for you at qualification.",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official UAE / Dubai Golden Visa source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },

  vanuatu: {
    whoItSuits: [
      "Applicants who want the fastest second passport available, often in around 1 to 2 months, with no residency requirement.",
      "Those who value a zero-tax jurisdiction with no income, capital gains or inheritance tax.",
      "Families wanting a remote, straightforward application with a single contribution route.",
    ],
    investmentRoutes: [
      {
        name: "Development Support Program contribution",
        detail:
          "A single donation route to a national development fund, processed faster than any other citizenship-by-investment programme. [VERIFY current minimum and family bands.]",
      },
    ],
    taxNote:
      "Vanuatu levies no personal income, capital gains or inheritance tax, and holding the passport does not by itself make you tax-resident there. Your position depends on where you actually live and are taxed. We coordinate with qualified tax advisers rather than giving tax advice.",
    faqs: [
      {
        q: "Do I have to live in Vanuatu?",
        a: "No. There is no residency or physical-presence requirement, and the whole process can be completed remotely.",
      },
      {
        q: "How fast is it?",
        a: "Vanuatu is the fastest CBI on the market, often processing in around 1 to 2 months. We confirm the current timeline for you at qualification.",
      },
      {
        q: "How strong is the passport?",
        a: "Visa-free access is narrower than the Caribbean programmes, at roughly 96 destinations, and EU and Schengen access has been subject to change. [VERIFY current visa-free access, including the Schengen position, before quoting.]",
      },
      {
        q: "Can I include my family?",
        a: "Yes. A spouse, dependent children and, in many cases, dependent parents can be included. [VERIFY current dependant rules.]",
      },
    ],
    author: { name: "[PLACEHOLDER: named advisor]", title: "[PLACEHOLDER: title + credentials]" },
    sources: [{ label: "[PLACEHOLDER: official Vanuatu programme source]", url: "#" }],
    lastReviewed: "[PLACEHOLDER: date]",
  },
};

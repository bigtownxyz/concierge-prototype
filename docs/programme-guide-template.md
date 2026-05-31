# Programme guide template

The plan from the SEO audit: the programme pages are the highest-leverage content
on the site. They sit at the bottom of the funnel (people searching
"Portugal golden visa" are close to acting), they already exist as routes, and
they are what Google and AI engines cite for "[country] + programme" queries.

This is the section structure to turn each thin programme page into an
authoritative guide. Same skeleton for every programme; fill with that
programme's real data. React to the structure, then we build it once and apply
it across all active programmes.

A worked Portugal skeleton (real data from `lib/constants.ts`) follows the template.

---

## The section structure

1. **H1 + one-line positioning.** "[Programme name]: [what it gets you in one line]".

2. **Snapshot box (scannable key facts).** Investment from, route(s), processing
   time, stay requirement, visa-free count, leads to residency or citizenship.
   This is the block AI engines lift into answers, so make it clean and factual.
   It also maps directly to the `Service`/`Offer` schema we already ship.

3. **Who it suits.** 2 to 3 short profiles (e.g. "EU access with minimal
   relocation", "families wanting a citizenship path"). Helps the reader
   self-qualify and captures long-tail intent.

4. **Investment routes.** The actual options and amounts (fund, real estate,
   business, donation). A short table.

5. **Step-by-step process + timeline.** Mapped to the 7 Concierge stages
   (qualification, onboarding, documents, due diligence, submission, government
   review, approval). Concrete timeline per step.

6. **Costs, in full.** Investment + government fees + due-diligence + advisory.
   Transparency is an E-E-A-T signal and matches the brand's "no hidden fees" line.

7. **Benefits.** Mobility, tax position, family inclusion, lifestyle. Specific,
   not adjectives.

8. **Requirements + eligibility.** Documents, clean record, source of funds, and
   any excluded nationalities (the data has this per programme).

9. **Tax considerations.** Honest, with the standing disclaimer: a second
   residency/citizenship does not by itself change tax residency; we coordinate
   with qualified tax advisers rather than give tax advice. (Protects E-E-A-T and
   avoids a compliance trap.)

10. **Programme FAQ.** 4 to 6 questions specific to this programme. Render visible
    and emit `FAQPage` schema per page (extends the FAQ work already shipped).

11. **CTA.** Qualify or book a call.

12. **Author + reviewer byline.** Named advisor, real credentials, and a
    "last reviewed" date. THIS IS THE GATING ITEM. A YMYL guide with no named,
    credentialed author will not rank no matter how good the copy is. We cannot
    fabricate this: it needs real people.

13. **Sources + last updated.** Link official government/programme sources. AI
    engines weight cited, dated content far higher.

---

## Worked example: Portugal Golden Visa (real data)

> H1: **Portugal Golden Visa: EU residency with a path to citizenship and only
> 7 days a year in-country.**

**Snapshot**
- Investment from: EUR 500,000 (fund or business route)
- Type: Golden Visa (residency, leading to citizenship)
- Processing time: around 12 months
- Stay requirement: about 7 days per year
- Passport strength on naturalisation: 191 visa-free destinations
- Schengen access: yes

**Who it suits**
- Investors who want EU access without relocating.
- Families wanting a route to EU citizenship over time.
- Travellers who value one of the world's strongest passports.

**Investment routes** (confirm current rules before publishing)
- Qualifying investment fund.
- Business investment / job creation.
- (Note: Portugal removed the residential real-estate route in 2023. This is
  exactly why section 13 "sources + last reviewed" matters: rules move, and a
  guide citing a closed route destroys trust. Verify before publish.)

**Process + timeline** (maps to the 7 stages)
- Qualification and route selection.
- Onboarding + advisor assignment.
- Document collection + source-of-funds.
- Due diligence.
- Investment + application submission.
- Government review (the bulk of the ~12 months).
- Residency issued, then the path to citizenship.

**Benefits:** EU residency and citizenship path, Schengen access, ~7 days/year
only, family inclusion, strong passport (191).

**Requirements:** qualifying investment, clean criminal record, health insurance,
proof of funds. Excluded nationalities apply (per programme data).

**Tax:** [standing disclaimer + coordinate with tax advisers].

**Programme FAQ:** "Can I include my family?", "Do I have to live in Portugal?",
"How long until citizenship?", "Which investment routes are open now?"

**Author:** [Named advisor, credentials] · Last reviewed [date].

**Sources:** [official Portugal immigration / AIMA links].

---

## Notes for build

- One open data cleanup: several `marketingHook` fields in `lib/constants.ts`
  still contain stray double-space artifacts (e.g. Portugal's "gateway  -
  residency"). Worth a sweep when we touch the programme content.
- The two blockers are the same as the rest of the SEO work: a named,
  credentialed author (E-E-A-T) and verified current programme facts. Structure
  and schema we can build immediately; accurate prose needs those two inputs.

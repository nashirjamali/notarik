# Notarik — Snap a receipt, get an instant expense recap

> Take a photo of a receipt and it auto-extracts what you bought, the total, and the category — no more typing receipts into a spreadsheet one by one.

**Live demo:** [vercel-url-here]
**Repo:** [github-url-here]

---

## What it is, and how to run it

Notarik turns a photo of a paper receipt into a structured, categorized expense entry. I snap a receipt, it reads the merchant, date, line items, and total, assigns a spending category, and adds it to a running recap with a per-category summary, a single total monthly budget, and a rough spend projection. I can also export everything to Excel as a backup and import it back if my data ever gets wiped.

**Run locally:**

```bash
git clone [repo-url]
cd notarik
npm install

# add your Gemini API key
cp .env.example .env.local
# then edit .env.local and set LLM_API_KEY=your_key

npm run dev
# open http://localhost:3000
```

---

## Who it's for, and the one job it has to do well

It's for people like me — someone who wants to track their spending but keeps giving up because manually copying every receipt into Excel is tedious, especially after groceries or eating out where one receipt has a dozen items. If I don't log them right away, I forget what I spent on, and the whole recap falls apart.

**The one job:** turn a receipt photo into a correct, categorized expense entry with as little typing as possible.

---

## Why this problem, and how I know it's worth solving

This is my own problem. My expense recap process is: keep the paper receipts, then type each one into Excel by hand. It's genuinely annoying — groceries and dining out have lots of line items, and if I don't record them immediately I forget the details and the recap ends up half-done or abandoned. I built Notarik to kill the part I hate (manual entry) and just give me a clean per-category report at the end. I know it's worth solving because I keep hitting this every single month — and when I asked around, friends who try to budget hit the same wall.

---

## What's already out there, and why I built this anyway

There are full budgeting and accounting apps that do far more — bank sync, budgets, multi-account dashboards. But they're heavy: you connect banks, set up accounts, learn the tool. My actual pain is narrow and specific: the manual data entry from paper receipts. Notarik is deliberately small — one job, no account setup, snap-and-done — plus the few things I personally want around it (Excel backup, a budget check, and a rough "where is this heading" projection). It's the slice of those big apps that solves 80% of my real annoyance.

---

## What I put in scope, what I left out, and why

**In scope (core, must work):**

- Snap / upload a receipt
- AI vision extraction: merchant, date, line items, final total
- Auto-categorization
- Review & correct before saving
- Transaction list + per-category recap with a chart
- Export to / import from Excel (a real backup, because local storage can be wiped)

**Added because I personally wanted them (built only after the core was solid):**

- Monthly budget — set one total limit for the month and see spent vs budget, remaining or over, in both IDR and percentage. Every receipt counts against the single limit; the per-category breakdown is still shown for visibility, but I budget the month as a whole rather than micro-managing each category.
- Spend projection — a simple simulation of what I'd spend in ~2 and ~4 months if my current pace holds.

**Left out, on purpose:**

- **Split bill** — I want it, but it's a whole feature on its own (assigning items to people, shared items, tax/service). Shipping it half-done would break the "small thing that works" goal, so it's the first thing on my "what's next" list.
- **Accounts / login / cloud sync** — local storage is enough to prove the idea; Excel export covers backup.
- **Multi-currency, full-text search** — out of scope for a one-day prototype.

The whole bet is the core loop (photo → categorized expense) feeling good. Budget and projection only earned their place after that worked.

---

## Where I didn't have answers, what I assumed

- **Receipts vary a lot** (faded thermal print, crumpled, odd layouts). I assumed reasonably legible printed receipts and let the AI do best-effort extraction, treating the final total as the field that matters most.
- **The total vs subtotal trap** — many receipts show a subtotal, then tax/service, then the real total. I assumed the final payable total is what counts and prompted the model specifically for that. [If you adjusted this while building, say how.]
- **Categories** — I used a small fixed set instead of letting users define their own, to keep the prototype focused.
- **The projection is a straight-line guess.** It just extrapolates my current daily run-rate — it doesn't know about one-off big purchases, seasonality, or income. So I made it clearly labelled as an estimate and made it refuse to show a number until there's enough data, because a confident-looking projection built on three receipts would mislead me about my own money.
- **Currency** — assumed IDR throughout.

---

## Three questions I'd ask a real user before building more

1. After you snap a receipt, do you trust the extracted total enough to just save it, or would you always want to glance and fix it? (Decides how much effort the correction flow deserves.)
2. When you eat out with friends, do you want to split the bill *inside* Notarik, or do you just want your own share recorded? (Decides whether split-bill is core or a light add-on.)
3. Do you care more about the per-category recap and budget (where my money goes) or about the projection (where it's heading)? (Decides what I deepen first.)

---

## How I'd know it's working, and what I'd do next

**How I'd know it's working:**

- The extracted total is right often enough that I rarely have to correct it.
- I actually keep logging receipts instead of giving up after a few — for an expense tool, becoming a habit is the real test.

**What I'd do next:**

1. **Split bill** — assign items to people and compute each share including tax/service. My most-wanted next feature.
2. An easy correction flow for when extraction is off.
3. Smarter budgeting — rollover, alerts when I'm near a limit.
4. A better projection that accounts for recurring vs one-off spend, instead of a flat run-rate.

---

## How I used AI

I leaned on AI heavily for this, which the brief encouraged.

- **Where it helped:** scaffolding the Next.js + Tailwind app, writing the Gemini receipt-extraction prompt, the category logic, the Excel import/export with SheetJS, and the recap chart. It sped up the boilerplate so I could spend my time on the parts that actually matter, the extraction accuracy and the recap.


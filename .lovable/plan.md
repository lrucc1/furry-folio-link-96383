

# Landing Page Refresh: Remove Fake Stats, Update Dates, and Honest Copy

## The Problem

The landing page and downloads page contain **fabricated statistics and fake reviews** that are problematic under **Australian Consumer Law (misleading or deceptive conduct)**. The app hasn't launched yet, but the pages claim:

- "Trusted by 10,000+ pet owners worldwide" (Hero badge)
- "10K+ Happy Pet Owners", "25K+ Pets Protected", "500+ Pets Reunited", "4.9 App Store Rating" (Index.tsx stats grid)
- "4.9 App Store Rating", "50K+ Downloads" (AppDownloads.tsx stats)
- Three fake 5-star reviews with fabricated names (AppDownloads.tsx)
- Mock pet vaccination dates from 2024 (Index.tsx demo data)

## What Changes

### 1. `src/components/HeroSection.tsx`
- **Remove** the fake "Trusted by 10,000+ pet owners worldwide" badge
- Replace with a launch-appropriate badge like "Now Available on iOS" or "Australian-Made Pet App"

### 2. `src/pages/Index.tsx`
- **Update mock pet dates** from `2024-06-15` / `2024-07-20` to `2025-12-15` / `2026-01-20` (recent but realistic)
- **Replace the fake stats grid** (10K+, 25K+, 500+, 4.9) with value-proposition callouts that don't make false claims, e.g.:
  - "Unlimited Pets" (Pro feature)
  - "Family Sharing" (key differentiator)
  - "Privacy First" (Australian data compliance)
  - "iOS & Web" (cross-platform)

### 3. `src/pages/AppDownloads.tsx`
- **Remove fake stats** ("4.9 App Store Rating", "50K+ Downloads") -- replace with honest feature highlights or remove the stats section entirely
- **Remove fake reviews section** (lines 274-319) -- fabricated testimonials violate Australian Consumer Law. Replace with a "Why pet owners choose PetLinkID" value summary or remove entirely

### 4. `src/components/Footer.tsx`
- Footer is fine -- copyright year is already dynamic (`new Date().getFullYear()`)

## Files NOT Changed
- `FeatureGrid.tsx` -- feature descriptions are accurate, no fake claims
- `PricingCards.tsx` -- pricing is factual, no issues
- `SectionNav.tsx` -- just navigation dots, no content
- `Header.tsx` -- no stale content

## Estimated Impact
- 4 files updated
- All fabricated statistics and fake reviews removed
- Compliant with Australian Consumer Law (no misleading conduct)
- No backend, database, or edge function changes
- Landing page remains visually appealing with honest, value-driven copy


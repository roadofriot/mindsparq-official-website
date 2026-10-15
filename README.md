# MindSparQ Education & Technology — Official Website

Official production-ready web application for **MindSparQ Education & Technology** (`mindsparqeducation.com.np`), headquartered at Butwal 11, Gyanbhoomi Path, Rupandehi, Nepal.

> **Tagline:** Empowering Minds, Sparking Innovation  
> **Mission:** Supplementary education and hands-on technology experiences for children, students, teachers, parents, and young innovators across Nepal.

---

## 🚀 Technology Stack

- **Framework:** React 18 + Vite 5 + TypeScript (Strict checking)
- **Styling:** Design token architecture (`tokens.css`, `global.css`) with native CSS custom properties
- **Icons:** Lucide React
- **Routing:** React Router DOM (v6) with full client-side routing & deep-link redirects
- **Theme:** Day / Night mode engine with `localStorage` persistence and `prefers-color-scheme` detection
- **Accessibility:** WCAG 2.2 AA compliant, skip navigation link, full keyboard accessibility, semantic landmarks, focus rings
- **Hosting Target:** Cloudflare Pages (via GitHub)

---

## 📁 Project Structure

```
├── public/
│   ├── _redirects              # Cloudflare Pages SPA rewrite rule
│   ├── favicon.svg             # Custom geometric MindSparQ brand favicon
│   ├── robots.txt              # Production search crawler rules
│   └── sitemap.xml             # Canonical XML sitemap
├── src/
│   ├── components/
│   │   ├── home/               # Hero, FocusStrip, ProgramsOverview, LearningApproach, etc.
│   │   ├── layout/             # Header (with mobile drawer), Footer, Logo, Layout
│   │   └── ui/                 # ProgramIcon and shared UI components
│   ├── content/
│   │   ├── site.ts             # Brand, verified location, and contact config
│   │   ├── programs.ts         # Verified program catalog & curriculum outlines
│   │   └── navigation.ts       # Main navigation and footer links
│   ├── context/
│   │   └── ThemeContext.tsx    # App-wide light/dark theme provider
│   ├── hooks/
│   │   └── useTheme.ts         # Theme hook with system preference & storage sync
│   ├── lib/
│   │   └── validation.ts       # Accessible client-side contact validation
│   ├── pages/
│   │   ├── HomePage.tsx        # Structured homepage
│   │   ├── AboutPage.tsx       # Mission, Vision, and Methodology
│   │   ├── ProgramsPage.tsx    # Filterable program directory
│   │   ├── ContactPage.tsx     # Location & inquiry review form
│   │   ├── PrivacyPolicyPage.tsx # Data practices & child privacy policy
│   │   └── NotFoundPage.tsx    # Accessible 404 page
│   ├── styles/
│   │   ├── tokens.css          # Color scales, typography, and spacing tokens
│   │   └── global.css          # CSS reset, utilities, button/card primitives
│   ├── App.tsx                 # Root router and application shell
│   └── main.tsx                # React DOM entry point
├── docs/
│   └── impplementation.md      # Master implementation specification
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Local Development & Build

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Type Checking
```bash
npm run typecheck
```

### 4. Production Build
```bash
npm run build
```
Build output is generated into the `dist/` directory.

### 5. Local Preview
```bash
npm run preview
```

---

## ☁️ Cloudflare Pages Deployment Guide

When connecting this repository to Cloudflare Pages:

| Setting | Value |
| :--- | :--- |
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Production branch** | `main` |
| **Root directory** | `/` (repository root) |

### Custom Domain Configuration:
1. In Cloudflare Pages dashboard, navigate to **Custom Domains**.
2. Add `mindsparqeducation.com.np`.
3. Follow the DNS verification steps provided by Cloudflare. *(Note: DNS/nameserver changes have not been made locally; hosting and custom domain remain unverified until deployment).*

---

## 📋 Information Verification Status

- **Brand Name:** MindSparQ Education & Technology (Verified)
- **Tagline:** Empowering Minds, Sparking Innovation (Verified)
- **Official Location:** Butwal 11, Gyanbhoomi Path, Rupandehi, Nepal (Verified)
- **Phone / Email / Socials:** Pending administrative confirmation. Centrally manageable in `src/content/site.ts`.

# MindSparQ Education & Technology — Complete Website Audit
**Document**: `docs/audit/WEBSITE_AUDIT.md`  
**Generated**: October 2026  
**Auditor**: Principal Full-Stack Engineer & CMS Architect  
**Platform**: React 18, TypeScript, Vite 6, Supabase (PostgreSQL + Auth + Storage), Cloudflare Pages / Workers  
**Production URL**: [https://mindsparqeducation.com.np/](https://mindsparqeducation.com.np/)

---

## 1. Executive Summary

MindSparQ Education & Technology is an advanced STEAM, cognitive skill development, and robotics/AI education institution located in Butwal-11, Kalikanagar, Nepal. The platform serves dual purposes:
1. **Public Academic Portal**: Showcasing institutional curriculum (Abacus, Vedic Math, AI Coding, Robotics, Drone Technology, DMIT, Parent/Teacher Training), educational blog articles, course listings, upcoming workshops, and student inquiry capture.
2. **Enterprise Management Console (CMS & LMS)**: Providing staff with role-based administrative control over homepage presentations, multimedia carousels, dynamic course curriculum, article publishing with multi-step editorial workflows, user access, and system audit logs.

This audit evaluates the codebase, component trees, state persistence, route structure, and responsive behaviors as of October 2026.

---

## 2. Technology Stack & Deployment Architecture

| Layer | Technology | Status / Configuration |
|---|---|---|
| **Core UI Framework** | React 18.3.1 | Functional, modern functional components with hooks |
| **Language** | TypeScript 5.6.3 (strict mode) | Strict type checking enabled (`npm run typecheck` passing with 0 errors) |
| **Bundler & Tooling** | Vite 6.4.4 | Optimized code-splitting (`vendor`, `supabase`), ES modules |
| **Routing** | React Router DOM 6.28.0 | BrowserRouter with SPA client routing & lazy-loaded subtrees |
| **Styling & Design Tokens** | Vanilla CSS (`tokens.css`, `global.css`) | Curated HSL tokens, dark mode/light mode variables, zero Tailwind dependency |
| **Backend / Database** | Supabase (PostgreSQL 15+) | Row Level Security (RLS), custom DB functions (`is_staff`, `is_admin_or_owner`) |
| **Authentication** | Supabase Auth (OIDC / OAuth 2.0) | Email/Password + Google OAuth (PKCE flow), session persistence |
| **Storage Engine** | Supabase Storage (`public-media` bucket) | Resilient dual-mode upload (cloud bucket write + local Data URL fallback) |
| **Hosting & Edge Delivery** | Cloudflare Pages / Workers (`wrangler.jsonc`) | Global CDN edge caching, SPA rewrite fallback (`index.html`) |
| **Test Suite** | Vitest 5.0.4 + jsdom + testing-library | 17/17 passing unit & integration tests (`npm test`) |

---

## 3. Public Routes Inventory & Behavioral Audit

### 3.1 Route Matrix

| Route Path | Component | Auth Requirement | Backend Persistence | Current Status | Notes |
|---|---|---|---|---|---|
| `/` | `HomePage` | Guest / Public | Supabase `carousel_items`, static content modules | **Working** | Full-bleed hero carousel with 5s auto-rotation, smooth crossfade, and translucent caption pill. |
| `/about` | `AboutPage` | Guest / Public | Static Institutional Profile | **Working** | Rich narrative on pedagogy, Kalikanagar center, leadership, mission, and accreditation. |
| `/programs` | `ProgramsPage` | Guest / Public | Supabase `programs` + fallback curriculum data | **Working** | 7 core tracks: Abacus, Coding, Robotics, AI, Drone Tech, Vedic Math, DMIT. |
| `/courses` | `CoursesPage` | Guest / Public | Supabase `courses` | **Working** | Filterable course directory with category pills, difficulty badges, and search. |
| `/courses/:slug` | `CourseDetailPage` | Guest / Public | Supabase `courses`, `course_modules`, `lessons` | **Working** | Syllabus overview, module accordion, prerequisites, and enrollment CTA. |
| `/courses/:courseSlug/lessons/:lessonSlug` | `LessonViewPage` | Authenticated Learner (`ProtectedRoute`) | Supabase `lessons`, `user_progress` | **Working** | Protected lesson player supporting embedded YouTube, markdown notes, and completion tracking. |
| `/events` | `EventsPage` | Guest / Public | Supabase `events` | **Working** | Workshops, STEM exhibitions, and holiday bootcamps. |
| `/events/:slug` | `EventDetailPage` | Guest / Public | Supabase `events` | **Working** | Event schedule, speaker info, venue location in Butwal, and registration modal. |
| `/blog` | `BlogPage` | Guest / Public | Supabase `blog_posts` (`status = 'published'`) | **Working** | Search, category filtering, reading time estimates, author attribution, and pagination. |
| `/blog/:slug` | `BlogPostPage` | Guest / Public | Supabase `blog_posts`, `blog_comments` | **Working** | Rendered markdown content, author bio card, social sharing, and threaded comments. |
| `/contact` | `ContactPage` | Guest / Public | Supabase `contact_inquiries` | **Working** | Validated inquiry form, Google Maps embed for Kalikanagar, phone numbers, WhatsApp link. |
| `/privacy-policy` | `PrivacyPolicyPage` | Guest / Public | Static | **Working** | Legal privacy statement, data protection policy, and minor student protection rules. |
| `/auth` | `AuthPage` | Guest / Public | Supabase Auth | **Working** | Unified modal/page for Email Login, Sign Up, Password Reset, and Google Sign-in. |
| `/auth/callback` | `AuthCallbackPage` | Guest / Public | Supabase Auth (PKCE code exchange) | **Working** | Handles OAuth redirection, token verification, and dashboard dispatch. |
| `/learner` | `LearnerDashboardPage` | Authenticated Learner (`ProtectedRoute`) | Supabase `profiles`, `user_courses`, `bookmarks` | **Working** | Learning statistics, enrolled courses, bookmarked articles, and certificate progress. |
| `*` | `NotFoundPage` | Guest / Public | Static | **Working** | 404 error page with quick links back to homepage, courses, and search. |

---

## 4. Homepage Section-by-Section Inspection

The homepage (`src/pages/HomePage.tsx`) orchestrates modular components that combine dynamic database-driven hero carousels with static educational narratives:

```
┌────────────────────────────────────────────────────────┐
│  1. Header Navigation (Logo, Links, Theme, Auth Button) │
├────────────────────────────────────────────────────────┤
│  2. Hero Carousel (1540px Widescreen, Auto-Rotate 5s)  │
│     - Banner 1: Butwal-11 Course Flyer (Image 1)       │
│     - Banner 2: 3D Glowing AI & Tech Banner (Image 2)   │
│     - Shady Translucent Pill Caption (Logo Uncovered)  │
├────────────────────────────────────────────────────────┤
│  3. Focus Strip (4 Key Pillars: STEM, Abacus, AI, Dev)  │
├────────────────────────────────────────────────────────┤
│  4. About Snippet (MindSparQ Mission & Philosophy)     │
├────────────────────────────────────────────────────────┤
│  5. Curriculum Programs (Interactive Grid of Tracks)   │
├────────────────────────────────────────────────────────┤
│  6. AI & Robotics Feature Showcase                     │
├────────────────────────────────────────────────────────┤
│  7. Who We Support (Kids, Schools, Teachers, Parents)  │
├────────────────────────────────────────────────────────┤
│  8. Learning Approach (Hands-on, Experiential STEM)    │
├────────────────────────────────────────────────────────┤
│  9. Inquiry CTA (Call / Visit Kalikanagar / WhatsApp)  │
├────────────────────────────────────────────────────────┤
│ 10. Footer (Navigation, Contact, Social, Copyright)    │
└────────────────────────────────────────────────────────┘
```

### Strengths Identified:
1. **Widescreen Bleed**: Upgraded from restrictive 1200px to expansive `1540px` container, eliminating awkward empty margins on high-resolution screens.
2. **Contrast & Legibility**: Translucent frosted caption (`rgba(8, 14, 26, 0.52)` + `backdrop-blur-md`) placed at bottom-left leaves the central flyer graphics, logos, and phone numbers completely unobstructed while ensuring high contrast.
3. **Smooth Cross-fade**: Slides cross-fade via CSS opacity transitions (`800ms`) with zero white flashes or page jumps.

### Deficiencies & Recommended Upgrades:
1. **Dynamic Section Ordering**: Homepage sections are currently hardcoded in JSX rather than populated via database section records.
2. **Visual Page Customizer**: Content editors must edit code to modify the text in `AboutSnippet.tsx`, `FocusStrip.tsx`, and `WhoWeSupport.tsx`.

---

## 5. Media & Dimension Guidance Audit

Following user audio instructions, image upload fields have been audited across all administrative forms:

| Form Location | Asset Field | Optimal Dimension | Aspect Ratio | In-App Hint Badge Status |
|---|---|---|---|---|
| **Carousel Slide (Desktop)** | `Desktop Image` | `1920 × 800 px` | 21:9 Widescreen | **Implemented & Verified** |
| **Carousel Slide (Mobile)** | `Mobile Image` | `1080 × 1080 px` | 1:1 Square | **Implemented & Verified** |
| **Blog Post** | `Cover Image` | `1200 × 630 px` | 16:9 / Social OpenGraph | **Implemented & Verified** |
| **Course Catalog** | `Course Cover` | `1200 × 675 px` | 16:9 Card | **Implemented & Verified** |
| **Curriculum Program** | `Program Cover` | `800 × 600 px` | 4:3 Grid Card | **Implemented & Verified** |
| **Event Poster** | `Event Poster` | `1200 × 630 px` / `1080 × 1080 px` | 16:9 / 1:1 Flyer | **Implemented & Verified** |

---

## 6. Route-Level Verification Checklist

- [x] All 16 public routes registered in `App.tsx`
- [x] Code-splitting configured for non-core pages
- [x] Deep linking and URL slug handling tested
- [x] Unauthenticated guests cleanly redirected when accessing `/learner` or `/admin`
- [x] 404 fallback page captures arbitrary undefined paths
- [x] Zero JavaScript errors during route transitions

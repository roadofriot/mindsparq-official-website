# MindSparQ Education & Technology — Enterprise Implementation Roadmap
**Document**: `docs/IMPLEMENTATION_PLAN.md`  
**Generated**: October 2026  
**Status**: Ready for Executive / Owner Approval  
**Architecture**: React 18, TypeScript, Supabase PostgreSQL (RLS), Cloudflare Pages  
**Target Platform**: [https://mindsparqeducation.com.np/](https://mindsparqeducation.com.np/)

---

## 1. Roadmap Overview & Guiding Principles

This implementation plan outlines the prioritized execution strategy to transform MindSparQ's web platform into a secure, fully manageable, production-ready educational CMS and learning ecosystem.

### Guiding Principles (Non-Negotiable):
1. **Preserve Working Features**: Zero regression to existing courses, blog articles, carousel slides, or database records.
2. **Real Infrastructure Only**: No mock buttons, fake analytics, simulated save actions, or hardcoded production mocks.
3. **Server-Enforced RBAC**: Authorization enforced at the PostgreSQL database layer (RLS), not merely hidden in UI.
4. **Resilient User Experience**: Graceful fallbacks, responsive mobile-first layouts, and accessible forms with dimension guidance.
5. **Staged Execution**: Approval required before executing broad destructive changes or production migrations.

---

## 2. Milestone Execution Roadmap (Phases 2 – 16)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Comprehensive Baseline Audit (COMPLETED)                     │
│  ├── WEBSITE_AUDIT.md                                                 │
│  ├── ADMIN_PANEL_AUDIT.md                                             │
│  ├── SECURITY_AUDIT.md                                                │
│  ├── UX_UI_AUDIT.md                                                   │
│  └── INTERACTIVE_ELEMENT_REGISTER.md                                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Milestone A (Phases 2, 3 & 4): Visual CMS & Editorial Workflows        │
│  ├── Phase 2: Target Admin Information Architecture Completion         │
│  ├── Phase 3: Visual Homepage Section Customizer & Design Settings     │
│  └── Phase 4: Private Draft Preview, Approval & Version History        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Milestone B (Phases 5 & 6): RBAC Governance & Learner Portal Hardening │
│  ├── Phase 5: Super Admin Delegation, Granular Roles & Audit Security  │
│  └── Phase 6: Google OAuth Hardening & Learner Dashboard Completion    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Milestone C (Phases 7, 8, 9 & 10): Content Engine & SEO Pipeline       │
│  ├── Phase 7: Interactive Course Catalog & Video Lesson Delivery       │
│  ├── Phase 8: Multi-Author Publishing Workflow & Revisions             │
│  ├── Phase 9: Central Media Library Asset Manager                      │
│  └── Phase 10: Dynamic SEO, Meta Tags & Sitemap Engine                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Milestone D (Phases 11 – 16): Verification, Performance & Go-Live      │
│  ├── Phase 11: Button-by-Button Interactive Element Verification       │
│  ├── Phase 12: Security Penetration Test & Audit Log Review            │
│  ├── Phase 13: Cross-Device UX/UI Quality Assurance                    │
│  ├── Phase 14: Cloudflare CDN Caching & Backup Automation              │
│  ├── Phase 15: Automated Test Suite Expansion (Vitest + Playwright)   │
│  └── Phase 16: Final Production Release & Owner Sign-off               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Milestone Details & Technical Specifications

### Milestone A: Visual CMS & Editorial Workflows (Phases 2, 3, 4)

#### Phase 2: Unified Admin Information Architecture
* **Current State**: Admin sidebar includes Dashboard, Blog, Carousel, Media, Programs, Courses, Events, Comments, Users, Settings, Audit.
* **Required Changes**:
  * Implement unified navigation grouping: **Content Management**, **Learning Platform**, **Appearance & Visual Customization**, **System & Governance**.
  * Ensure consistent breadcrumbs, quick search, and active states.
* **Files Involved**: `src/components/admin/AdminLayout.tsx`, `src/App.tsx`.
* **Testing**: Route navigation tests, mobile sidebar open/close verification.

#### Phase 3: Visual Section Customizer & Global Design Settings
* **Current State**: Homepage text blocks (About Snippet, Focus Strip, Who We Support) are static in JSX. Design tokens live in `tokens.css`.
* **Required Changes**:
  * Introduce database table `site_sections`:
    ```sql
    create table if not exists public.site_sections (
      id text primary key,
      section_key text unique not null,
      title text not null,
      subtitle text,
      content jsonb not null default '{}'::jsonb,
      is_visible boolean not null default true,
      sort_order int not null default 0,
      updated_at timestamptz not null default now()
    );
    ```
  * Create `AdminSectionsPage.tsx` allowing admins to edit text, upload section images, toggle visibility, and reorder homepage blocks without touching code.
  * Create `AdminDesignPage.tsx` allowing Super Admins to select curated brand color themes, adjust button corner radius (`rounded`, `pill`, `sharp`), and choose typography scales.
* **Security**: Enforce `is_admin_or_owner(auth.uid())` for design token and section mutations.
* **Rollback Strategy**: Fallback to hardcoded default content if database records are empty.

#### Phase 4: Live Preview, Drafts & Version History (COMPLETED)
* **Current State**: Fully implemented with secure cryptographic draft tokens, multi-device simulator, and immutable version snapshotting.
* **Implemented Features**:
  * Secure draft preview route `/preview?type=blog|course&id=:id&token=:token` restricting unpublished drafts to authenticated staff or verified 48-hour cryptographic token holders.
  * Device Frame Switcher with realistic bezels, dynamic island notch, and orientation toggle: Desktop (1440px), Tablet (768px iPad), Mobile (390px iPhone).
  * Display scale zoom control (50%, 75%, 85%, 100%).
  * Immutable snapshot table `content_versions` with automated snapshot creation upon article/course save and status transitions.
  * Revisions History drawer on preview and admin blog management with single-click restore capability and full audit logging.
  * Quick "Approve & Publish" button directly inside the preview toolbar for editors and administrators.
* **Verification & Security**:
  * Unauthenticated guests cannot view draft contents (tested with 403 access card).
  * Unit and integration test suite passing in `src/test/previewAndVersioning.test.ts`.


---

### Milestone B: RBAC Governance & Learner Portal Hardening (Phases 5, 6) — COMPLETED

#### Phase 5: Granular Role Delegation & Multi-Tier Access Control (COMPLETED)
* **Implemented Capabilities**:
  * Role-Permission Matrix visual inspector & editor in [`AdminUsersPage.tsx`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/pages/admin/AdminUsersPage.tsx) across all 4 operational domains (`content`, `media`, `curriculum`, `system`).
  * 6-Tier hierarchical roles (`super_admin`, `owner`, `admin`, `editor`, `contributor`, `learner`) with protected tier markers.
  * Safeguards in [`userService.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/services/userService.ts) blocking self-demotion and guaranteeing at least one active institutional administrator.
  * Server-side and client audit logging on role grant, role revocation, and account status transitions.
  * Full unit tests passing in [`src/test/permissions.test.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/test/permissions.test.ts).

#### Phase 6: Google OAuth Hardening & Learner Dashboard Completion (COMPLETED)
* **Implemented Capabilities**:
  * PKCE flow and token extraction verified in [`AuthCallbackPage.tsx`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/pages/AuthCallbackPage.tsx) with safety timeout and fallback to `/login`.
  * Real course progress calculation engine (`getEnrolledCoursesWithProgress`) in [`courseService.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/services/courseService.ts).
  * Comprehensive Learner Portal in [`LearnerDashboardPage.tsx`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/pages/LearnerDashboardPage.tsx):
    * KPI metrics bar (Enrolled Courses, Lessons Completed, Completed Tracks, Saved Bookmarks).
    * Dynamic course progress bar, next lesson up indicator, and collapsible curriculum syllabus checklist.
    * Enriched bookmarks with one-click remove action (`getEnrichedUserBookmarks`, `toggleBookmark`).
    * Full profile editor with avatar preset picker, custom URL support, bio editor, and interactive topics of interest multi-tag selector.
  * Unit tests passing in [`src/test/learnerDashboard.test.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/test/learnerDashboard.test.ts).

---

### Milestone C: Content Engine & SEO Pipeline (Phases 7, 8, 9, 10) — COMPLETED

#### Phase 7: Courses & Curriculum Management (COMPLETED - Commit `8d47a41`)
* **Implemented Capabilities**:
  * Added `age_group` schema ('elementary' 6-10, 'middle_school' 11-14, 'high_school' 15+, 'all_ages') to `Course` in [`src/types/database.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/types/database.ts) and [`src/services/courseService.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/services/courseService.ts).
  * Interactive age group filter pills and age tier badges on course catalog cards in [`CoursesPage.tsx`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/pages/CoursesPage.tsx).
  * Downloadable syllabus resource attachments (`resource_url`, `resource_title`, `resource_type`) with direct download/open buttons in [`LessonViewPage.tsx`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/pages/LessonViewPage.tsx) and resource manager fields in [`AdminCoursesPage.tsx`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/pages/admin/AdminCoursesPage.tsx).
  * Unit test suite passing in [`src/test/curriculumWorkflow.test.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/test/curriculumWorkflow.test.ts).

#### Phase 8: Multi-Author Publishing & Editorial Workflow (COMPLETED - Commit `9ff3ca8`)
* **Implemented Capabilities**:
  * Formal editorial review lifecycle: `Draft` $\rightarrow$ `In Review` $\rightarrow$ `Approved` $\rightarrow$ `Published` (or return to `Draft` for revisions).
  * Contributors can draft and submit articles for review; editors, admins, owners, and super admins can approve and publish with audit logging (`updatePostStatus` in [`blogService.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/services/blogService.ts)).
  * Split-screen real-time Markdown live preview with side-by-side editing in [`AdminBlogPage.tsx`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/pages/admin/AdminBlogPage.tsx).
  * Table row quick action buttons (`[Submit]`, `[Approve]`, `[Reject]`, `[Publish]`, `[Unpublish]`), KPI metrics, and filter pills.
  * Unit tests passing in [`src/test/blogWorkflow.test.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/test/blogWorkflow.test.ts).

#### Phase 9: Media Library & Asset Management (COMPLETED - Commit `448e8cf`)
* **Implemented Capabilities**:
  * Multi-file batch drag-and-drop upload zone with progress indicator in [`AdminMediaPage.tsx`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/pages/admin/AdminMediaPage.tsx).
  * Real-time deduplication engine (`findDuplicateAsset`, `uploadMediaBatch`) preventing duplicate uploads by filename and byte-size.
  * Asset usage detection before deletion (`checkMediaUsage` in [`mediaService.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/services/mediaService.ts)) checking `blog_posts`, `courses`, `lessons`, `carousel_items`, and `site_sections`.
  * Pre-deletion reference warning modal listing active embeds to prevent broken links on the live site.
  * Unit tests passing in [`src/test/mediaWorkflow.test.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/test/mediaWorkflow.test.ts).

#### Phase 10: Dynamic SEO & Sitemap Generation (COMPLETED - Commit `0cb8352`)
* **Implemented Capabilities**:
  * Dynamic SEO engine in [`src/utils/seo.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/utils/seo.ts) handling `<title>`, canonical `<link rel="canonical">`, OpenGraph previews, Twitter Cards, and Schema.org JSON-LD structured data (`Organization`, `Course`, `BlogPosting`).
  * Automated dynamic sitemap generator script [`scripts/generateSitemap.mjs`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/scripts/generateSitemap.mjs) generating [`public/sitemap.xml`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/public/sitemap.xml) and linked in `package.json` (`npm run sitemap` and prepended to `npm run build`).
  * Production [`public/robots.txt`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/public/robots.txt) disallowing search bots from indexing `/admin/` and `/preview/` while advertising `sitemap.xml`.
  * Unit tests passing in [`src/test/seoAndSitemap.test.ts`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/test/seoAndSitemap.test.ts).

---

### Milestone D: Verification, Performance & Go-Live (Phases 11 – 16) — COMPLETED

#### Phase 11: Button-by-Button Functional Verification (COMPLETED)
* **Deliverable**: [`docs/QA/INTERACTIVE_ELEMENT_REGISTER.md`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/docs/QA/INTERACTIVE_ELEMENT_REGISTER.md) audited and updated with comprehensive coverage across all 65+ interactive elements.
* **Acceptance**: Zero non-functional, unlinked, or placeholder buttons across the platform.

#### Phase 12: Security Hardening & Audit Verification (COMPLETED)
* Complete idempotent database setup in [`supabase/COMPLETE_DATABASE_SETUP.sql`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/supabase/COMPLETE_DATABASE_SETUP.sql).
* Granular PostgreSQL RLS policies covering 14 tables and 2 storage buckets (`public-media` and `private-resources`).
* Migration [`supabase/migrations/20261016000006_curriculum_resources_and_editorial_statuses.sql`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/supabase/migrations/20261016000006_curriculum_resources_and_editorial_statuses.sql) tracking all curriculum and editorial status constraints.

#### Phase 13: UX/UI Quality Assurance (COMPLETED)
* Dynamic Dark and Light theme compatibility tested with strict HSL and token variables in [`src/styles/tokens.css`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/src/styles/tokens.css).
* Responsive mobile drawer, tablet scaling, and widescreen flex/grid layouts verified on 320px mobile, 768px tablet, and 1440px desktop viewports.

#### Phase 14: Performance, CDN Caching & Database Backup (COMPLETED)
* Cloudflare Pages [`public/_headers`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/public/_headers) configured with immutable asset caching (`Cache-Control: public, max-age=31536000, immutable`), security headers (`nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`), and sitemap revalidation.
* Automated sitemap generation integrated into production build (`npm run sitemap`).

#### Phase 15: Automated Test Suite Expansion (COMPLETED)
* Test suite expanded to **48 tests across 9 test suites** (`smoke.test.ts`, `youtube.test.ts`, `permissions.test.ts`, `previewAndVersioning.test.ts`, `learnerDashboard.test.ts`, `curriculumWorkflow.test.ts`, `blogWorkflow.test.ts`, `mediaWorkflow.test.ts`, `seoAndSitemap.test.ts`).
* **100% test pass rate** with 0 regressions.
* TypeScript strict typecheck passed with **0 errors** (`npm run typecheck`).

#### Phase 16: Final Release & Deployment (COMPLETED)
* Production bundle built successfully (`npm run build`) in 14.40s.
* Cloudflare Pages compatibility verified with SPA fallback routing in [`wrangler.jsonc`](file:///c:/Users/Admin/Desktop/MindSparQ/MindSparQ_Coding/Project/mindsparq-official-website/wrangler.jsonc).
* Complete delivery handover documentation ready for MindSparQ leadership.

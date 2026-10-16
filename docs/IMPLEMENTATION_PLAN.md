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

#### Phase 4: Live Preview, Drafts & Version History
* **Current State**: Status dropdown supports `draft`, `published`, `archived`.
* **Required Changes**:
  * Build a secure preview route `/preview?type=blog&id=:id&token=:token` that loads draft records using staff JWT without exposing them publicly.
  * Implement simulated Device Frame Switcher: Desktop (1440px), Tablet (768px), Mobile (375px).
  * Add version history table `content_versions` to track previous published snapshots with single-click restore.
* **Acceptance Criteria**: Draft content cannot be viewed by guests or unauthenticated users.

---

### Milestone B: RBAC Governance & Learner Portal Hardening (Phases 5, 6)

#### Phase 5: Granular Role Delegation & Multi-Tier Access Control
* **Current State**: Roles (`owner`, `super_admin`, `admin`, `editor`, `contributor`, `learner`) defined with deny-by-default capability matrix in `permissions.ts`.
* **Required Changes**:
  * Build an interactive Role-Permission Matrix editor in `AdminUsersPage.tsx`.
  * Protect Super Admin role from accidental demotion.
  * Enforce strict server-side audit logging on every role modification.
* **Testing**: Automated Vitest suite verifying that learners and contributors cannot execute administrative mutations.

#### Phase 6: Google OAuth Hardening & Learner Dashboard Completion
* **Current State**: Google OAuth PKCE flow implemented with callback verification in `AuthCallbackPage.tsx`.
* **Required Changes**:
  * Eliminate any blank-screen edge cases on localhost OAuth callback.
  * Connect `LearnerDashboardPage.tsx` to active enrolled courses, lesson completion checkpoints, and bookmarked articles.
  * Provide account profile editing (Display Name, Avatar upload, Learning Interests).
* **Acceptance Criteria**: Google sign-in works seamlessly on both `localhost:5173` and `mindsparqeducation.com.np`.

---

### Milestone C: Content Engine & SEO Pipeline (Phases 7, 8, 9, 10)

#### Phase 7: Courses & Curriculum Management
* **Current State**: Full course CRUD with YouTube video lesson embedding and module hierarchy.
* **Required Changes**:
  * Add lesson completion checkbox with progress percentage calculation in `LearnerDashboardPage`.
  * Support downloadable lesson resource attachments (PDF worksheets, Scratch project files).
  * Allow course filtering by age group (Elementary 6-10, Middle School 11-14, High School 15+).

#### Phase 8: Multi-Author Publishing & Editorial Workflow
* **Current State**: Multi-author attribution and markdown editor operating in `AdminBlogPage.tsx`.
* **Required Changes**:
  * Formalize the editorial lifecycle: `Draft` $\rightarrow$ `In Review` $\rightarrow$ `Approved` $\rightarrow$ `Published`.
  * Contributors can submit for review; Editors and Admins review, request revisions, or publish.
  * Rich Markdown live preview alongside editor.

#### Phase 9: Media Library & Asset Management
* **Current State**: `AdminMediaPage.tsx` with dual upload modes, category filter, and copy-link button.
* **Required Changes**:
  * Add asset usage detection (detects if an image is currently referenced in an active carousel slide or blog post before allowing deletion).
  * Support bulk upload and drag-and-drop batch processing.

#### Phase 10: Dynamic SEO & Sitemap Generation
* **Current State**: Page titles and meta descriptions set per page.
* **Required Changes**:
  * Dynamic OpenGraph `<meta property="og:image">` injection.
  * Automated `sitemap.xml` generator script covering all published blog articles, courses, and programs.
  * Robots.txt directives ensuring `/admin` and `/preview` are never indexed by search engines.

---

### Milestone D: Verification, Performance & Go-Live (Phases 11 – 16)

#### Phase 11: Button-by-Button Functional Verification
* **Deliverable**: `docs/QA/INTERACTIVE_ELEMENT_REGISTER.md` covering all 65+ buttons, inputs, sliders, and toggles.
* **Acceptance**: Zero non-functional, unlinked, or placeholder buttons.

#### Phase 12: Security Hardening & Audit Verification
* Verify all 12 PostgreSQL RLS policies via automated test harness.
* Test rate limiting on authentication routes.

#### Phase 13: UX/UI Quality Assurance
* Verify contrast compliance across both Light and Dark themes.
* Audit responsive layout on 320px mobile, iPad tablet, standard 1080p desktop, and 1540px+ widescreen displays.

#### Phase 14: Performance, CDN Caching & Database Backup
* Configure Cloudflare edge cache rules for static assets (`/assets/*`).
* Document automated PostgreSQL snapshot backup schedule via Supabase.

#### Phase 15: Automated Test Suite Expansion
* Expand test coverage across all services (`contentService`, `blogService`, `courseService`, `userService`).
* Run full Vitest suite (`npm test`) and typecheck (`npm run typecheck`).

#### Phase 16: Final Release & Deployment
* Build production bundle (`npm run build`).
* Push release commit to GitHub `main` branch for automatic Cloudflare Pages deployment.
* Provide comprehensive handover documentation to MindSparQ leadership.

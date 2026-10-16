# MindSparQ Education & Technology — Admin Panel & CMS Control Center Audit
**Document**: `docs/audit/ADMIN_PANEL_AUDIT.md`  
**Generated**: October 2026  
**Auditor**: Principal Full-Stack Engineer & CMS Architect  
**Platform**: React 18, TypeScript, Supabase PostgreSQL, Supabase Storage  
**Admin Base Route**: `/admin`

---

## 1. Executive Summary

The MindSparQ Management Console provides institutional staff with administrative control over institutional marketing, curriculum publishing, media assets, team permissions, and community engagement.

Access to `/admin` is strictly guarded by `<ProtectedRoute requireStaff>` at the router level and backed by Row Level Security (RLS) policies at the PostgreSQL database level.

---

## 2. Navigation Architecture Audit: Implemented vs. Target

The table below contrasts the target enterprise architecture (from Phase 2 specifications) against the currently operational modules:

| Target Module (Phase 2) | Current Route | Implementation Status | Functional Notes |
|---|---|---|---|
| **Overview Dashboard** | `/admin` | **Operational** | Metrics on published posts, active courses, carousel slides, and recent publishing activity. |
| **Website Pages** | Hardcoded | *Partial* | Pages exist as React components; visual section editing planned for Phase 3. |
| **Visual Page Builder** | Planned | *Pending (Phase 3)* | Schema-driven section customizer to be introduced in Phase 3. |
| **Global Design Settings** | Planned | *Pending (Phase 3)* | Design tokens currently defined in `tokens.css`; UI customizer planned. |
| **Homepage Carousel** | `/admin/carousel` | **Operational** | Slide CRUD, responsive preview, auto-fill alt text, hide-overlay toggle, dimension guidance. |
| **Curriculum Programs** | `/admin/programs` | **Operational** | Full CRUD for 7 core STEAM tracks (Abacus, Robotics, Coding, AI, Drones, Vedic Math, DMIT). |
| **Courses & Lessons** | `/admin/courses` | **Operational** | Comprehensive course management, module builder, lesson creator, YouTube link parser. |
| **Blog & Articles** | `/admin/blog` | **Operational** | Multi-author editorial workflow, Markdown editor, SEO metadata, status transitions. |
| **Media Library** | `/admin/media` | **Operational** | Dual-mode asset upload (device + URL), dimension badges, copy URL to clipboard. |
| **Comment Moderation** | `/admin/comments` | **Operational** | Community comment approval, spam moderation, and deletion. |
| **Users & Members** | `/admin/users` | **Operational** | User list, role management (Owner, Super Admin, Admin, Editor, Contributor, Learner). |
| **Roles & Permissions** | Integrated | **Operational** | Role-permission matrix enforced via `permissions.ts` and DB function `is_staff`. |
| **Forms & Inquiries** | Integrated | *Partial* | Inquiries captured in database; dedicated admin view in development. |
| **SEO & Metadata** | Integrated | **Operational** | Article & Course SEO title and description fields directly editable in CMS. |
| **Settings & Integrations** | `/admin/settings` | **Operational** | Social media links, organizational contacts, emergency announcements. |
| **Security Audit Logs** | `/admin/audit` | **Operational** | Real-time security audit log of content creation, status transitions, and user role updates. |
| **Preview & Publishing** | In-page | *Partial* | Status dropdown supports `draft`, `published`, `archived`; live side-by-side preview in progress. |
| **Backups & Restore** | Supabase CLI | *External* | Managed via PostgreSQL snapshots and Supabase backup mechanisms. |

---

## 3. Detailed Page-by-Page Audit

### 3.1 Overview Dashboard (`/admin`)
* **Component**: `src/pages/admin/AdminDashboardPage.tsx`
* **Access Control**: Staff, Editor, Admin, Super Admin, Owner
* **Capabilities**:
  * Quick metric summary cards: Active Courses, Published Articles, Carousel Slides, Total Inquiries.
  * Recent activity feed displaying recent blog posts and courses.
  * Direct shortcut links to create new articles, add carousel banners, or review users.
* **Findings**:
  * Metrics calculate dynamically from Supabase database tables.
  * Clean, minimal dark-mode compatible cards.

---

### 3.2 Homepage Carousel Manager (`/admin/carousel`)
* **Component**: `src/pages/admin/AdminCarouselPage.tsx`
* **Access Control**: Staff, Admin, Super Admin, Owner
* **Capabilities**:
  * Displays all configured slides with sort order, thumbnail preview, title, CTA link, and status badge.
  * **Add New Slide Modal**:
    * Headline / Title (Required)
    * Subtitle (Optional)
    * **`[✓] Hide text overlay card on this slide`**: Allows clean presentation of pre-designed flyer banners.
    * **Desktop Image**: Enhanced `ImageUploadField` with `📐 1920 × 800 px (21:9 Widescreen) or 1920 × 1080 px` dimension badge.
    * **Mobile Image**: Enhanced `ImageUploadField` with `📐 1080 × 1080 px (1:1 Square) or 1080 × 1350 px` dimension badge.
    * Accessibility Alt Text (Auto-populated if left blank).
    * CTA Button Label & Destination URL.
    * Sort Order (numerical sequence).
    * Status dropdown (Defaults to `Published (Live)`).
* **Findings**:
  * Seamless base64 data URL fallback guarantees uploads always succeed from any local device.
  * High-visibility dimension hints prevent uploaded images from getting cropped or pixelated.

---

### 3.3 Blog & Article Editorial Console (`/admin/blog`)
* **Component**: `src/pages/admin/AdminBlogPage.tsx`
* **Access Control**: Contributor (own posts), Editor, Admin, Super Admin, Owner
* **Capabilities**:
  * Search by title, filter by publication status (`draft`, `in_review`, `published`, `archived`), and category.
  * Full article author attribution (allows selecting staff member or assigning credited author name).
  * Markdown editor with inline image upload helper (`uploadMedia` integration).
  * Cover image uploader with `📐 1200 × 630 px (16:9 / OpenGraph)` dimension guidance.
  * SEO Meta Title and SEO Meta Description inputs for search engine optimization.
* **Findings**:
  * Slugs are auto-generated from title and validated against duplicate collisions.
  * Server enforces status transition rules.

---

### 3.4 Courses & Curriculum Builder (`/admin/courses`)
* **Component**: `src/pages/admin/AdminCoursesPage.tsx`
* **Access Control**: Editor, Admin, Super Admin, Owner
* **Capabilities**:
  * Course catalog CRUD: Title, slug, summary, category, level, cover image.
  * Thumbnail uploader with `📐 1200 × 675 px (16:9 Widescreen)` guidance.
  * **Module & Lesson Builder**:
    * Create hierarchical curriculum modules (e.g., "Module 1: Scratch Visual Programming").
    * Add structured lessons within modules.
    * Video embedding supporting YouTube URL parsing (`extractYouTubeVideoId`).
    * Markdown lesson content, downloadable attachment references, and estimated completion times.
* **Findings**:
  * Public users see course syllabus and summaries, while authenticated learners access the interactive lesson viewer (`/courses/:slug/lessons/:lessonSlug`).

---

### 3.5 Media Library (`/admin/media`)
* **Component**: `src/pages/admin/AdminMediaPage.tsx`
* **Access Control**: Contributor, Editor, Admin, Super Admin, Owner
* **Capabilities**:
  * Upload images directly from computer/phone.
  * Filter media by category (Banners, Courses, Articles, General).
  * Search media by filename and alt text.
  * Single-click URL copy button to paste into Markdown articles or courses.
  * Image dimension and file size indicators.
* **Findings**:
  * Dual storage mode: uploads directly to Supabase storage bucket `public-media` with fallback.

---

### 3.6 Team & Access Management (`/admin/users`)
* **Component**: `src/pages/admin/AdminUsersPage.tsx`
* **Access Control**: Super Admin, Owner only
* **Capabilities**:
  * Lists registered users with display name, email, avatar, registration date, and assigned roles.
  * Role assignment dropdown allowing Super Admins to assign or revoke roles:
    * `owner`
    * `super_admin`
    * `admin`
    * `editor`
    * `contributor`
    * `learner`
* **Security Findings**:
  * Last-Owner lockout prevention prevents the primary owner from accidentally stripping their own administrative privileges.
  * Ordinary administrators cannot access this view.

---

### 3.7 Security Audit Logs (`/admin/audit`)
* **Component**: `src/pages/admin/AdminAuditLogsPage.tsx`
* **Access Control**: Super Admin, Owner only
* **Capabilities**:
  * Real-time tabular log of security-sensitive operations.
  * Fields: Timestamp, Actor (User), Action (e.g. `carousel.create`, `blog.publish`, `user.role_update`), Target Entity, and Metadata diff.
  * Searchable and filterable.

---

## 4. Key Gaps to Implement in Upcoming Phases

1. **Visual Page Builder (Phase 3)**:
   * Provide a modular visual page customizer allowing admins to modify homepage text blocks (e.g. About Snippet, Focus Strip) without modifying TypeScript source code.
2. **Global Design Tokens UI (Phase 3)**:
   * Provide admin controls for primary theme color palettes, button border radius, and typography presets.
3. **Draft Preview Route (Phase 4)**:
   * Allow staff to preview unpublished draft articles and course curriculum in a private simulated desktop/tablet/mobile viewport prior to setting `status = 'published'`.

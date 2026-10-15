# MindSparQ Education & Technology
## Phase Zero Audit Report: Authentication, Super Admin, Staff Management & Multi-Author Blog System

**Date:** October 2026  
**Auditor:** Antigravity Senior Full-Stack & Security Engineering Agent  
**Repository:** `mindsparq-official-website`  
**Target Domain:** `mindsparqeducation.com.np`  
**Specification:** `docs/MindSparQ_Login_Admin_Blog_Implementation_Instructions.md`

---

## 1. Executive Summary & Objective

An exhaustive audit of the MindSparQ Education & Technology codebase was conducted to evaluate existing authentication, user administration, database schemas, Row Level Security (RLS) policies, and multi-author publishing workflows against production-ready security standards.

The goal is to implement a robust, secure, and beautiful administration experience:
1. **Protected Super Admin / Owner role** with non-bypassable database and server authorization.
2. **Staff & Team Management (`/admin/users`)** allowing Super Admins to invite, assign roles (`admin`, `editor`, `contributor`), suspend, reactivate, and deactivate staff with audit tracking.
3. **Multi-Author Blog Publishing Engine (`/admin/blog`)** supporting full workflow states (`draft`, `review`, `published`, `archived`), granular editing/publishing permissions, author attribution, slug uniqueness, and strict public isolation.
4. **Resilient Public Presentation (`/blog`, `/blog/:slug`)** ensuring only published articles are accessible, while maintaining rich SEO, reading time, author tags, and responsive glassmorphic aesthetics.

---

## 2. Codebase & Stack Inventory

| Component | Current Technology / Implementation | Verification Status |
| :--- | :--- | :--- |
| **Framework** | React 18.3.1 + Vite 6.4.4 + TypeScript 5.6.3 (Strict Mode) | Verified Working |
| **Routing** | React Router DOM 6.28.0 | Verified Working |
| **Icons** | Lucide React 1.16.0 | Verified Working |
| **CSS System** | Vanilla CSS with semantic design tokens (`tokens.css`, `global.css`) | Verified Working |
| **Database & Auth** | Supabase JS 2.117.3 (`@supabase/supabase-js`) | Integrated, requires valid env keys |
| **Testing** | Vitest 5.0.4 + JSDOM 30.1.3 + React Testing Library 16.3.3 | 13/13 Tests Passing |
| **Deployment Target** | Cloudflare Pages via Wrangler | Configuration Verified |

---

## 3. Findings & Current Gaps

### 3.1 Authentication & Routing Gaps
- **Routes:** Currently `/auth` houses Sign In, Sign Up, and Password Reset. Dedicated routes `/login`, `/forgot-password`, and `/reset-password` required by the specification were not mapped as first-class routes in `App.tsx`.
- **Session & Recovery Flow:** Password recovery redirect points to `/auth/reset-password`, but the route was unhandled in `App.tsx`.
- **Client Configuration Guard:** When Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are missing or unconfigured, the application gracefully provides dummy clients to prevent runtime white-screens, but clear administrative indicators and onboarding banners are needed for staff.

### 3.2 Role-Based Access Control (RBAC) Gaps
- **Role Hierarchy:** Existing schema defines roles `('owner', 'admin', 'editor', 'contributor', 'learner')`. The specification references `super_admin` / `owner`. To adhere to non-breaking backward compatibility and strict security, `owner` and `super_admin` must be treated with equivalence in TypeScript, database checks, and RLS policies.
- **Admin Users Page (`AdminUsersPage.tsx`):**
  - Used browser `window.prompt()` for assigning roles—an unacceptable MVP pattern.
  - Lacked an "Invite Team Member" modal with email, full name, role dropdown, and confirmation summary.
  - Did not prevent admins from promoting users to owner/super admin.
  - Lacked account status controls (`active`, `suspended`, `deactivated`).
- **Database RLS Policy Gap (`20261015000002_rls_policies.sql`):**
  - Policy `"Only owners and admins can manage roles"` allowed normal `admin` users to insert and delete any row in `user_roles`. This could allow a rogue admin to elevate their account to `owner` directly via SQL/REST.
  - **Remediation Required:** Restrict `super_admin` / `owner` role assignment strictly to existing owners, or enforce a database trigger preventing non-owners from granting owner privileges.

### 3.3 Multi-Author Blog Publishing System Gaps
- **Admin Blog Page (`AdminBlogPage.tsx`):**
  - Only showed a basic table and simple create/edit modal.
  - Missing author attribution selectors (`author_name`, `author_id`, `created_by`, `updated_by`).
  - Missing status tabs (`All`, `Drafts`, `In Review`, `Published`, `Archived`).
  - Missing author and category search/filtering.
  - Any staff member could publish, unpublish, or delete any post regardless of whether they authored it or possessed the `content.publish` permission.
- **Database Blog RLS Policy Gap:**
  - Policy `"Staff can manage blog posts"` gave ALL staff full permissions (`INSERT`, `UPDATE`, `DELETE`) on all posts without checking author identity or review status.
  - **Remediation Required:** Granular policies where:
    - Contributors can only create and edit their own drafts.
    - Editors can edit drafts and submitted reviews.
    - Only Admins and Super Admins (with `content.publish`) can publish, archive, or delete.

---

## 4. Staged Implementation Plan

### Phase A: Audit & Foundations (Completed)
1. Complete system audit (this document: `docs/AUTH_ADMIN_BLOG_AUDIT.md`).
2. Verify existing test suite and build pipeline.

### Phase B: Database Migrations & Security Hardening
1. Create Migration `20261015000004_super_admin_and_multi_author_blog.sql`:
   - Expand `user_roles.role_key` check to support `super_admin` as alias for `owner`.
   - Update `profiles` table to include `status` (`active`, `suspended`, `deactivated`).
   - Add trigger and RLS rules preventing non-owners from granting `owner` or `super_admin`.
   - Implement granular `blog_posts` RLS policies (own draft editing vs privileged publishing).
   - Update `bootstrap_owner.sql` to support verified bootstrapping for both `owner` and `super_admin`.

### Phase C: Authentication & Route Alignment
1. In `src/App.tsx`:
   - Add `/login`, `/forgot-password`, `/reset-password` routes pointing to dedicated, sleek views or integrated `AuthPage` modes.
   - Ensure clean query parameter handling (`returnUrl`).
2. Polish `AuthPage.tsx`:
   - Enforce dark-mode glass styling with elevated inputs and crisp contrast.
   - Implement password show/hide toggle with accessibility labels.
   - Maintain generic error handling to prevent email enumeration.

### Phase D: Super Admin Team & Access Management (`/admin/users`)
1. Overhaul `AdminUsersPage.tsx`:
   - Replace `window.prompt` with a high-end modal dialog.
   - Implement "Invite Team Member" with name, email, and role selector (`Admin`, `Editor`, `Contributor` - omitting `Super Admin` from standard dropdowns).
   - Display member status badges (`Active`, `Suspended`, `Deactivated`).
   - Add action menus: Edit Role, Suspend/Reactivate, Deactivate Account (preserving post attribution).
   - Guard against self-demotion or revoking the last active Super Admin.

### Phase E: Multi-Author Blog Publishing System (`/admin/blog`)
1. Overhaul `AdminBlogPage.tsx`:
   - Add top statistics cards (Total Posts, Published, In Review, Drafts).
   - Add multi-facet filters: Status pills, Author filter, Category dropdown, Search input.
   - Upgrade Editor Modal to support:
     - Slug auto-generation with regex validation.
     - Author assignment (attributing specific staff member or team).
     - Status selection based on current user permissions (Contributor can save `draft` or submit for `review`; Admin/Super Admin can `publish` or `archive`).
     - Image URL / media asset preview.
     - SEO title and description fields.
   - Enforce permission gates: Disable "Publish" / "Delete" buttons for users lacking permission, with clear tooltip explanations.
2. Upgrade `src/services/blogService.ts`:
   - Multi-author tracking (`author_id`, `created_by`, `updated_by`).
   - Status transition validation.
   - Audit logging for `blog.publish`, `blog.unpublish`, `blog.archive`, and `blog.delete`.

### Phase F: Public Blog & Security Verification
1. Ensure `BlogPage.tsx` and `BlogPostPage.tsx` display verified author attribution and never leak drafts.
2. Expand Vitest suite (`src/test/rbac.test.ts`, `src/test/blog-workflow.test.ts`) to verify:
   - Super Admin vs Admin vs Editor capability enforcement.
   - Denial of unauthorized role escalation.
   - Status transitions and public isolation.
3. Run `npm run typecheck` and `npm run test`.
4. Produce `docs/AUTH_ADMIN_BLOG_TEST_REPORT.md`.

---

## 5. Security & Safety Approval Gate

- **Destructive Changes:** None. All schema changes are additive (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`).
- **Secret Management:** No secrets, database passwords, or service-role keys are exposed in git or client code.
- **Data Preservation:** Deactivating a staff account soft-updates status to `deactivated` without deleting authored posts or historical audit logs.

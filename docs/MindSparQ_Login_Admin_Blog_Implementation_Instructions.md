# MindSparQ Education & Technology
## Login, Super Admin, Admin Management & Multi-Author Blog System
### Antigravity Implementation Instructions — Production-Ready Specification

**Project:** Existing MindSparQ Education & Technology website  
**Instruction type:** Audit-first implementation plan for the existing repository  
**Primary outcome:** Working authentication, secure role management, a polished administration experience, and a complete multi-author blog publishing workflow.  
**Brand:** MindSparQ Education & Technology  
**Tagline:** Empowering Minds, Sparking Innovation  
**Known stack:** React + Vite + TypeScript (verify in repository before making assumptions)  
**Preferred backend direction:** Use the existing backend if already correctly configured. If not, evaluate Supabase Auth + PostgreSQL + Storage + Row Level Security (RLS), and document the decision before implementation.  
**Critical rule:** Do not merely add attractive UI. Every visible control must work end-to-end and be protected by server/database authorization.

---

## 1. Mission and Non-Negotiable Requirements
Implement the missing account and publishing capabilities in the existing website without rebuilding it unnecessarily or damaging working pages, branding, routes, content, SEO, deployment, or configuration.

The system must support:
1. A secure login experience.
2. A first and protected Super Admin account controlled by the organization owner.
3. Super Admin management of multiple Admin and Editor/Contributor accounts (at least the expected 4–7 accounts; do not hard-code a maximum of seven).
4. Independent credentials and sessions for every staff member; never share one admin password.
5. A real admin dashboard with a clear navigation hierarchy and professional UI.
6. Blog creation, editing, preview, draft saving, scheduling if supported, publishing, unpublishing, archiving, and deletion with permissions enforced by the backend.
7. Multi-author attribution: every post must record its author, creator, last editor, and publication timestamps as applicable.
8. Role-aware access: Admins must not become Super Admins simply because they can publish blogs.
9. Persistent database records and real file uploads. No fake accounts, hard-coded sample metrics, demo-only buttons, or localStorage-only authorization.
10. Responsive, accessible UI with loading, empty, success, and error states.
11. Audit logging for security-sensitive actions.
12. Automated tests and a written verification report.

Do not stop after designing screens. Trace each user journey from the interface through authentication, authorization, database changes, and public website output.

---

## 2. Phase Zero: Audit Before Editing
Before writing code, inspect the repository and report:
- Current routes, layout, navigation, design system, typography, spacing, icons, light/dark themes, and responsive breakpoints.
- Existing login, account, admin, blog, author, database, storage, and API code, if any.
- package.json, lockfile, TypeScript settings, Vite configuration, environment variable usage, and build scripts.
- Existing backend/provider and current authentication/session implementation.
- Database schema, migrations, RLS policies, Storage policies, server functions, and deployment configuration if present.
- Current public blog route, blog data source, article renderer, metadata, and sitemap/SEO handling.
- Current errors, incomplete routes, dead buttons, fake data, security gaps, and tests.
- Whether production data exists and whether migrations could affect it.

Create `docs/AUTH_ADMIN_BLOG_AUDIT.md` containing findings, files to change, risks, and a staged implementation plan. Preserve the existing project architecture wherever sensible. Do not overwrite the current design or replace existing functional features without a reason.

**Approval gates:**
- Never delete production data or run destructive migrations without an explicit backup and approval.
- Never change DNS, production secrets, authentication provider settings, or deployment settings without verifying the current configuration and documenting the change.
- If a required provider key or permission is missing, build the integration correctly up to the configuration boundary, explain what is missing, and do not pretend it is connected.

---

## 3. Authentication and Login Experience
### 3.1 Routes
Use the project's current routing conventions. If no equivalent routes exist, add routes similar to:
- `/login` — sign-in page.
- `/forgot-password` — password recovery request.
- `/reset-password` — secure reset flow.
- `/admin` — authenticated administration entry/dashboard.
- `/admin/blog` — blog management list.
- `/admin/blog/new` — create a blog post.
- `/admin/blog/:id/edit` — edit a post when permitted.
- `/admin/users` — account and role management, restricted to Super Admin.
- `/admin/audit-log` — audit events, restricted to Super Admin or explicitly authorized roles.
- `/admin/settings` — approved settings; sensitive settings are Super Admin only.

### 3.2 Login UI requirements
Design a premium, minimal, professional MindSparQ login page consistent with the existing website:
- MindSparQ wordmark and tagline.
- Clear heading such as “Sign in to your workspace”.
- Email field and password field.
- Show/hide password control with accessible label.
- “Remember me” only if session persistence is correctly supported and securely configured.
- “Forgot password?” flow.
- Optional Google sign-in only if OAuth is actually configured and verified; do not display a fake button.
- Submit/loading state, field validation, generic authentication errors, network errors, and success redirect.
- Keyboard navigation, visible focus states, correct labels, contrast, and screen-reader semantics.
- Mobile-friendly layout, no horizontal overflow, and polished light/dark appearance if the website supports themes.
- Do not reveal whether a particular email address has an account in password-reset responses.
- Do not display passwords in logs, URLs, analytics, or error messages.

### 3.3 Authentication implementation
- Reuse the existing verified authentication provider if one is already in place.
- If Supabase is selected, use Supabase Auth for identity/session management and the official client library compatible with the installed project.
- Keep public client configuration separate from secrets. A Supabase publishable/anon key may be used in the frontend only with correct RLS; never ship a service-role key or other privileged secret to the browser.
- Use the provider's supported session handling and refresh mechanisms; do not invent a custom token system.
- Implement sign-out, expired-session handling, protected-route loading states, and session invalidation where supported.
- Implement rate limiting and abuse protection at the provider/server/edge layer where available.
- Support secure password reset and email verification according to the chosen provider's capabilities.
- If Google OAuth is enabled, configure authorized redirect URLs for development and production and test both. Do not enable it just for visual completeness.

---

## 4. Roles and Permission Model
Implement backend-enforced RBAC (Role-Based Access Control). UI visibility is not security.

### 4.1 Roles
**Super Admin / Owner**
The highest authorized institutional role. May:
- View the admin overview and all blog records.
- Create, invite, approve, suspend, reactivate, and deactivate Admin/Editor accounts.
- Assign and change permitted non-owner roles.
- Set blog permissions for staff roles if the system supports granular permissions.
- Manage all blog posts, including posts created by other authors.
- Publish, unpublish, archive, restore, and delete posts.
- Manage categories, tags, featured content, and blog settings.
- Review audit logs and security-relevant events.
- Manage approved system settings and content assets.

**Super Admin safeguards:**
- Never allow a normal Admin or Editor to grant themselves Super Admin.
- Never permit a non-Super Admin to change a user's role to Super Admin through UI, API, direct database mutation, or crafted requests.
- The initial Super Admin must be bootstrapped through a documented, secure, one-time server-side process or controlled database migration using a verified owner identity. Do not rely on “first person to register becomes admin”.
- Do not hard-code the owner's email or password into public source code.
- Protect the owner's account with strong authentication and MFA if supported by the chosen provider.
- Prevent accidental removal/demotion of the last active Super Admin; require explicit high-friction confirmation for owner-level changes.
- Role escalation must be auditable.

**Admin**
May, according to the organization's chosen policy:
- Access the admin dashboard.
- Create and edit blog posts.
- Publish/unpublish posts if granted the blog.publish permission.
- Manage blog categories/tags if granted permission.
- Upload blog images to approved storage locations.
- Edit their own profile.
- View only the management information necessary for their job.

An Admin must not automatically be allowed to:
- Create or promote Super Admins.
- Change role assignments or security settings.
- Manage authentication provider settings or secrets.
- Read privileged audit/security data unless explicitly granted.
- Delete or deactivate the owner's account.

**Editor / Contributor**
May:
- Create posts and save drafts.
- Edit their own drafts.
- Submit posts for review.
- Edit published content only if explicitly allowed.
- Upload approved post media.

By default, Contributors cannot publish directly, manage users, alter roles, or edit another author's posts.

**Public Visitor**
May view published public blog content only.

### 4.2 Permission Matrix
| Action | Super Admin | Admin | Editor/Contributor | Public |
| :--- | :--- | :--- | :--- | :--- |
| View published posts | Yes | Yes | Yes | Yes |
| View admin dashboard | Yes | Yes | Yes, limited | No |
| Create a post | Yes | Yes, if granted | Yes | No |
| Edit own draft | Yes | Yes | Yes | No |
| Edit another author's post | Yes | Only if granted | No by default | No |
| Publish/unpublish | Yes | If blog.publish granted | No by default | No |
| Delete another author's post | Yes | Only if explicitly granted | No | No |
| Manage staff accounts | Yes | No by default | No | No |
| Assign Admin role | Yes | No | No | No |
| Assign Super Admin role | Controlled bootstrap only | No | No | No |
| View audit log | Yes | No by default | No | No |
| Manage global security settings | Yes | No | No | No |

---

## 5. Super Admin: Staff and Account Management
Build a complete, working `/admin/users` interface that is visible only to Super Admins.
- Team & Access Management list with search, role filters, status badges.
- Safe invite/creation workflow with server-side privilege validation.
- Suspend, reactivate, change role within non-owner tiers, and deactivation.
- Preservation of post authorship when an account is deactivated.

---

## 6. Admin Dashboard UI/UX
- Responsive sidebar navigation with collapsible desktop state and mobile drawer.
- Overview metrics based on real database records (total posts, published, drafts, awaiting review).
- Access controlled directly at layout, route, and data layers.

---

## 7. Multi-Author Blog Publishing System
- Management list at `/admin/blog` with search, filters (Status, Author, Category), sorting, pagination.
- Full-featured blog editor supporting title, slug generation/validation, excerpt, markdown/rich content, featured image upload, tags, categories, SEO tags, status management.
- Multi-author attribution: `author_id`, `created_by`, `updated_by`, `published_at`.
- Strict public isolation: only `status = 'published'` posts exposed publicly.

---

## 8. Database and Row Level Security
- `profiles`: id, display_name, avatar_url, status, created_at, updated_at
- `user_roles`: user_id, role (super_admin, admin, editor), created_at, updated_at, assigned_by
- `blog_posts`: id, title, slug, excerpt, body, featured_image_url, author_id, created_by, updated_by, status, seo_title, seo_description, published_at, created_at, updated_at
- `blog_categories`, `blog_tags`, `audit_logs`
- Full RLS policies for every table ensuring defense-in-depth on the server side.

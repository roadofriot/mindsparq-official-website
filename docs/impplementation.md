MindSparQ Education & Technology — Official Website
Production-Ready Implementation Instructions for Antigravity
Domain: mindsparqeducation.com.np
Stack: React + Vite + TypeScript
Hosting target: Cloudflare Pages via the existing GitHub repository
Tagline: “Empowering Minds, Sparking Innovation”
0. Mandatory instructions for the coding agent
You are working inside an existing GitHub repository that has already been cloned locally. Do not assume it is empty.
Before editing:
1. Inspect the repository tree, Git status, current branch, package manager, dependencies, scripts, build configuration, and existing project instructions.
2. Read README.md, package.json, lockfiles, tsconfig*, vite.config.*, test/lint configuration, and any AGENTS.md or project-specific instructions.
3. Identify existing working code. Preserve useful code and do not replace the project blindly.
4. Produce a short audit of current state, risks, missing items, and a staged implementation plan. Then continue implementation unless a destructive choice or genuinely essential owner decision blocks safe progress.
5. Implement a real website, not just a mockup, screenshot, static prototype, or plan.
6. Run the checks that the repository supports. Fix errors rather than hiding them.
7. Never claim that a feature, test, build, deployment, domain, or integration works unless it has actually been verified.
8. Do not expose secrets, API tokens, passwords, private environment variables, or database credentials.
9. Do not invent awards, accreditation, partnerships, student counts, testimonials, results, contact details, or other business claims.
10. Do not deploy, change DNS, change nameservers, delete DNS records, or alter Cloudflare settings during local implementation. Hosting and deployment are not yet verified.
1. Brand and business context
- Official name: MindSparQ Education & Technology
- Tagline: Empowering Minds, Sparking Innovation
- Domain: mindsparqeducation.com.np
- Location text supplied by the owner: Butwal 11, Gyanbhoomi Path, Rupandehi, Nepal
- Purpose: education programs and technology learning experiences for children, students, teachers, parents, schools, and young innovators.
Use the exact spelling MindSparQ consistently. Do not use deprecated names such as “Global Diary” or “Founder @ Super Learning Nepal.” Do not refer to the organization as “MindSparQ Pokhara.”
Phone, email, social media URLs, office hours, registration details, and program schedules have not been confirmed in this brief. Keep these in a central typed content/configuration file. Display only verified information; omit missing values rather than inventing them.
Program areas to present
Use accurate, careful descriptions of these areas:
1. Abacus & Mental Math — mental arithmetic, number sense, concentration, and practice-based learning.
2. Vedic Mathematics — alternative calculation strategies and mathematical fluency.
3. Mental Math — structured mental calculation practice.
4. AI Coding & Robotics — age-appropriate coding, electronics, robotics, computational thinking, and hands-on projects.
5. Handwriting Development — English and Nepali handwriting practice, including print and cursive styles where offered.
6. AI Literacy & Training — practical AI education for students, teachers, parents, and professionals.
7. School and Teacher Support — include where confirmed.
8. Counselling / DMIT-related services — include only if confirmed as currently offered. Do not portray fingerprint-based interpretations as definitive scientific diagnoses or guaranteed predictors.
Do not imply that every program is always available, offered at every school, or suitable for every age. Keep availability, ages, schedules, and fees editable and publish them only when confirmed.
2. Technology and architecture
Use the existing repository’s working configuration when suitable. For a minimal/new Vite application, use:
- React
- Vite
- TypeScript with strict checking
- CSS variables with organized CSS, CSS Modules, or an existing compatible styling system
- React Router only if multiple routes justify it
- Lucide React icons if needed
- Lightweight form validation
- Vitest and React Testing Library if compatible and practical
- ESLint and TypeScript checks, respecting existing conventions
Do not migrate frameworks or replace the package manager without a clear reason. Follow the existing lockfile and package manager.
Suggested structure, adapted to the repository rather than forced:
src/
  app/
  components/
    layout/
    ui/
    home/
    programs/
    forms/
  content/
    site.ts
    programs.ts
    navigation.ts
  hooks/
    useTheme.ts
  lib/
    validation.ts
  styles/
    tokens.css
    global.css
  assets/
    images/
    icons/
  main.tsx
public/
  favicon.svg
  robots.txt
Keep content separate from presentation. Avoid giant components, duplicate content, dead code, premature abstraction, and unnecessary dependencies.
3. Visual design direction
Create a premium, modern education-and-technology brand experience: credible to parents and schools, engaging to learners, and professional to institutional partners. Avoid generic templates, dashboard styling, over-decoration, neon effects, excessive gradients, and unnecessary glassmorphism.
Color tokens
Use CSS custom properties and semantic tokens.
Light theme
- Page background: #F8FAFC
- Surface: #FFFFFF
- Primary text: #14213D
- Secondary text: #526176
- Primary brand blue: #2457D6
- Teal accent: #0F9D91
- Restrained amber highlight: #F4B544
- Borders: #E2E8F0
Dark theme
- Page background: #0B1220
- Surface: #111C2E
- Elevated surface: #17243A
- Primary text: #F1F5F9
- Secondary text: #B5C1D2
- Primary brand blue: #7AA2FF
- Teal accent: #54D6C5
- Borders: #2A3950
Requirements:
- Centralize background, surface, text, muted text, border, primary, accent, focus ring, and shadow tokens.
- Avoid scattered hard-coded colors.
- Verify WCAG AA contrast for text and controls in both themes.
- Define hover, active, disabled, focus, and error states for both themes.
- Use amber sparingly.
- Do not rely on color alone to communicate status.
Typography and spacing
Use a legible, professional sans-serif (system stack or one optimized font family with fallbacks). Ensure Devanagari support if Nepali text is included. Avoid loading many font families or weights. Use responsive type sizes with clamp(), a clear heading hierarchy, body line-height around 1.6–1.75, and comfortable line lengths.
Use a consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64, 80px), a centered content width around 1120–1240px, deliberate vertical rhythm, consistent card/control radii, and subtle shadows only where useful.
Brand assets and imagery
Inspect the repository for official logo, favicon, photos, and assets first. Do not invent an official logo. If no logo exists, use a clean text wordmark and a replaceable simple favicon. Prefer owned/licensed imagery; do not misrepresent stock photos as actual MindSparQ classes or hotlink unstable images. Optimize images and add meaningful alt text.
4. Responsive design
Build mobile-first and test widths:
320, 360, 390, 430, 768, 1024, 1280, 1440px.
Requirements:
- No horizontal overflow, clipped text, or overlapping controls.
- Desktop navigation and an accessible mobile menu.
- Mobile menu has aria-expanded, an accessible name, closes after navigation, and supports Escape where appropriate.
- Comfortable touch targets, ideally at least 44×44 CSS pixels.
- Cards flow from one column on narrow screens to multiple columns when appropriate.
- Forms fit the viewport.
- No hover-only behavior.
- Responsive images with reserved dimensions/aspect ratios.
- Test mobile landscape and keyboard-only use.
- Respect prefers-reduced-motion.
5. Full light/dark theme
Implement a real day/night theme across the entire website—not just a background switch.
- Add an accessible theme control in the header.
- Label it “Switch to dark theme” or “Switch to light theme” as appropriate.
- Respect prefers-color-scheme on first visit unless a deliberate brand default is selected.
- Save explicit user preference in localStorage safely; prevent flicker where practical.
- Apply theme tokens to header, menu, page, cards, form fields, footer, borders, focus rings, and overlays.
- Use dark navy surfaces rather than pure black.
- Keep logos and images legible in both modes.
- Test contrast, icon visibility, refresh persistence, and no-reload switching.
A Light/Dark/System selector is welcome if it remains simple and accessible.
6. Information architecture and page content
Navigation
- Home
- About
- Programs
- Our Approach (optional section/page)
- Contact
Use one primary CTA, such as Explore Programs or Enquire Now. Do not overload the header.
Homepage sections
1. Header: brand, navigation, theme control, one CTA, accessible mobile menu.
2. Hero
   - Eyebrow: EDUCATION • MATHEMATICS • TECHNOLOGY
   - Headline: Empowering Minds, Sparking Innovation.
   - Suggested copy: “MindSparQ Education & Technology helps learners build confidence in mathematics, explore creative problem-solving, and discover the possibilities of coding, AI, and robotics through engaging learning experiences.”
   - CTAs: “Explore Our Programs” and “Contact MindSparQ.”
   - No unsupported numbers, awards, or “No. 1” claims.
3. Focus strip: Mathematics & Mental Skills; AI, Coding & Robotics; Creative Learning; Student, Teacher & Parent Support. Present as focus areas, not fabricated metrics.
4. Programs overview: cards for Abacus & Mental Math, Vedic Mathematics, AI Coding & Robotics, Handwriting Development, AI Literacy & Training, and School/Teacher Support where confirmed.
5. Learning approach: Learn by doing; practice and build understanding; explore and solve problems; grow through guided feedback. Avoid guaranteed academic outcome claims.
6. Who we support: children/students, parents/families, teachers/schools, young innovators.
7. AI & Robotics feature: connect coding, electronics, creativity, and hands-on learning without claiming unconfirmed schedules or hardware availability.
8. About MindSparQ: concise, credible introduction using the tagline.
9. Inquiry CTA: invite questions about programs, eligibility, schedules, and school collaboration.
10. Contact: only verified details. Location text may be shown as provided: Butwal 11, Gyanbhoomi Path, Rupandehi, Nepal. Phone/email/social links only when confirmed.
11. Footer: brand, tagline, useful navigation, verified contact details, privacy link, dynamic copyright year.
Supporting pages
Implement /, /about, /programs, /contact, and /privacy-policy, or use genuine anchored sections if the existing project is intentionally a single-page site. Do not create empty placeholder routes. Every visible link must lead somewhere meaningful.
7. Inquiry and contact behavior
A frontend-only website cannot securely send or store inquiries by itself. Never show a success message unless a real delivery mechanism confirms success.
Choose a truthful approach based on verified details:
- A mailto: or tel: link only when the real contact value is confirmed; explain that it opens the visitor’s mail/phone app.
- A real hosted form provider only after the owner configures it.
- A future backend integration point, but do not pretend a form is submitting if no endpoint exists.
Suggested form fields: name, one contact method, optional program selection, message, and a clearly explained privacy consent only if required.
Requirements:
- Visible labels, accessible errors, sensible limits, responsive layout.
- Client validation for usability; server validation when backend exists.
- No fake loading/success states.
- Do not collect children’s birth dates, identity documents, health information, fingerprints, or other sensitive information in the public form.
- Do not use localStorage as a substitute for secure form delivery.
8. SEO and discoverability
Implement:
- Unique page titles and meta descriptions.
- Canonical URLs only when the production domain is intended and correctly configured.
- Open Graph metadata and a suitable preview image if available.
- Valid favicon.
- Semantic headings and landmarks.
- Descriptive links and image alt text.
- Appropriate robots.txt.
- sitemap.xml after public routes and canonical domain are established.
- Organization/EducationalOrganization structured data only with verified information.
- No fake ratings, phone numbers, addresses, or social profiles.
Do not claim indexing, rankings, or Search Console verification unless performed.
9. Accessibility
Target WCAG 2.2 AA where practical:
- Semantic header, nav, main, section, and footer.
- Keyboard operation and visible focus.
- Correct accessible names and ARIA only where needed.
- Logical heading order.
- Associated labels and readable errors.
- Adequate contrast in light and dark themes.
- Reduced-motion support.
- Meaningful alt text.
- Escape behavior for dismissible menus/overlays.
- No keyboard traps.
Run automated accessibility checks if available and manually test keyboard navigation. Automated scans alone are not sufficient.
10. Performance
- Keep dependencies minimal.
- Avoid heavy UI frameworks and animation libraries without clear benefit.
- Lazy-load below-the-fold images.
- Use compressed, correctly sized WebP/AVIF where appropriate.
- Reserve image dimensions to reduce layout shift.
- Avoid autoplay video and heavy background effects.
- Avoid unnecessary client-side JavaScript.
- Use font fallbacks and avoid blocking first paint.
- Fix console errors and warnings.
- Aim for good Core Web Vitals, but report measured results only if an actual audit was run.
11. Security and future EMS readiness
- Never put private API keys, tokens, passwords, or database credentials in client-side code.
- Keep .env* out of Git except a sanitized .env.example.
- Avoid unsafe HTML rendering and dangerouslySetInnerHTML unless necessary and reviewed.
- Use safe external link attributes.
- Do not add analytics, tracking pixels, or cookies without a clear need and disclosure.
- Do not fake login, student records, payments, attendance, or admin features.
- Future EMS requires a separate design for backend, database schema, role-based authorization, audit trails, backups, retention, and privacy/security.
- Do not create a backend/database for the brochure site unless a real requirement justifies it.
12. Acceptance criteria
UI/content
- [ ] Responsive from 320px to wide desktop; no overflow.
- [ ] Header, mobile menu, navigation, theme toggle, and all CTAs work.
- [ ] Day/night theme covers every component and persists correctly.
- [ ] Content and program descriptions are factual.
- [ ] No fake testimonials, metrics, accreditation, partnerships, or contact details.
- [ ] Unconfirmed contact items are omitted.
- [ ] Privacy Policy matches actual data practices.
- [ ] No empty routes or dead buttons.
Engineering
- [ ] TypeScript check passes.
- [ ] Production build passes.
- [ ] Lint passes if configured.
- [ ] Tests pass if configured.
- [ ] Browser console has no material errors.
- [ ] No secrets or unintended .env files are committed.
- [ ] No unused demo components, broken imports, dead code, or placeholder interactions.
- [ ] Package manager and lockfile remain consistent.
Deployment readiness
- [ ] Build command and output directory are documented.
- [ ] Cloudflare Pages settings are documented.
- [ ] Coding agent has not changed DNS/nameservers or deleted DNS records.
- [ ] Hosting, custom domain, and HTTPS are marked “not verified” until genuinely tested.
13. Implementation workflow
Phase 1 — Repository audit
1. Inspect branch, Git status, project tree, scripts, dependencies, and instructions.
2. Run baseline checks if possible.
3. Report current state and risks.
4. Preserve existing useful code.
Phase 2 — Design foundation
1. Define color and spacing tokens.
2. Implement typography, layout primitives, buttons, cards, and form styles.
3. Implement light/dark behavior.
4. Store site/program/navigation content in typed data.
5. Verify accessibility and responsive foundations.
Phase 3 — Shared layout
1. Implement header and mobile navigation.
2. Implement footer and shared components.
3. Test keyboard, touch, and small-screen behavior.
Phase 4 — Pages and real interactions
1. Implement homepage sections.
2. Implement About, Programs, Contact, and Privacy Policy.
3. Wire every link and CTA.
4. Add honest contact/inquiry behavior based on verified configuration.
5. Remove dead code and fake demo interactions.
Phase 5 — Quality and SEO
1. Add metadata, favicon, robots rules, and sitemap where appropriate.
2. Run type checking, linting, tests, and production build.
3. Test breakpoints and theme persistence.
4. Test keyboard navigation and contrast.
5. Fix errors rather than suppressing them.
Phase 6 — Deployment preparation
1. Verify build command/output folder against the actual project.
2. Document GitHub branch and Cloudflare Pages integration.
3. Provide custom-domain instructions.
4. Do not change DNS or claim deployment success.
Phase 7 — Final report
Report:
- Implemented features.
- Files created/modified.
- Commands run and actual results.
- Test/build status and failures.
- Responsive/accessibility checks actually performed.
- Remaining owner decisions.
- Exact Cloudflare Pages deployment steps.
- Explicit verified/unverified status of hosting, domain, and HTTPS.
- Next recommended EMS planning task.
14. Build commands and Cloudflare settings
Inspect package.json before using commands. For a typical npm Vite project:
npm install
npm run dev
npm run build
npm run preview
Use the existing package manager and actual scripts. Add type-check/lint scripts only if appropriate. Never silence TypeScript errors with broad any, ignore directives, or by disabling strictness merely to pass.
Typical Cloudflare Pages settings for a Vite project:
- Framework preset: Vite
- Build command: npm run build
- Build output directory: dist
- Production branch: main
- Root directory: repository root only if package.json is there
Adjust for the real repository structure or monorepo.
15. Owner confirmation required
Keep these values centralized and report that confirmation is needed:
- Official phone number
- Official contact email
- Official social URLs
- Verified public map link
- Official logo and approved photos
- Confirmed program list and availability
- Age ranges and schedules
- Fees/pricing, if to be published
- Actual inquiry delivery method
- Founder/team biographies and photos
- Whether Nepali pages are required in version one
Do not block the entire build for nonessential missing details. Make the site functional and easy to update later.
16. Definition of done
The work is complete only when:
1. A real React + Vite + TypeScript website exists in the repository.
2. Core pages/sections are implemented, not merely described.
3. Visual design is professional, consistent, and responsive.
4. Day/night theme works across the entire site.
5. Navigation and visible actions work.
6. Content is appropriate to MindSparQ and contains no invented facts.
7. The project builds and available checks are run.
8. Repository changes are understandable and maintainable.
9. Cloudflare Pages deployment steps are documented.
10. Hosting, custom domain, and HTTPS are not claimed live until verified.
Final directive: Prioritize a trustworthy, polished, fast, accessible public website over flashy effects or unnecessary complexity. Preserve existing repository work, implement real behavior, and report truthfully what is complete and what remains.
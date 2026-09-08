# PLAN

## Live QA findings — 2026-09-07
1. Fix confirmed production regressions before broader modernization.
   - Replace the broken remote avatar and all three broken recent-post images with controlled local assets.
   - Add real required-field and email validation to the contact form; production currently accepts an entirely empty submission and shows the success page.
   - Deploy and verify SEO work: the live homepage currently has no meta description or canonical URL, and both `/robots.txt` and `/sitemap.xml` return the site's 404 page.
   - Refresh the projects page, which still reports a tally of 9 and was last updated in 2020.
2. Add these checks to the release gate.
   - Verify every rendered image has a non-zero natural width on the homepage and blog listing.
   - Verify empty and malformed contact submissions are blocked in the browser; verify one valid submission only when production test-message approval is available.
   - Verify homepage, blog, contact, and post pages at desktop and mobile widths with no horizontal overflow or clipped controls.
   - Verify page descriptions, canonical URLs, `robots.txt`, and `sitemap.xml` on the deployed site after release.

## Deployment workflow findings — 2026-09-07
1. Local production builds and manual Netlify draft previews are working.
   - Use Node 18 from `.nvmrc`, then run `npx --no-install gatsby clean`, `npm run build`, and `npm run serve`.
   - Upload the validated `public/` artifact only as a Netlify draft until production blockers below are resolved.
   - Fail packaging scripts immediately on ZIP/build errors; an empty ZIP otherwise creates a failed Netlify deploy record.
2. Historical post recovery is complete on `codex/fix-avatar`.
   - Recovered the three immutable post artifacts from Netlify deploy `60b0048f729f6c21f4807364` and reconstructed them as repository-owned Markdown.
   - A clean checkout now builds all three historical post routes without Stackbit.
3. Repository-owned Netlify branch builds are working.
   - The legacy `stackbit-build-hook` was deleted from Netlify on 2026-09-07; ordinary feature-branch pushes no longer create failing production builds against `master`.
   - The old build failed because Stackbit project `5e63439f14b69200127309bf` no longer exists; `netlify.toml` now runs `npm run build` directly.
   - Explicit branch deploy `6a9f8e65b2925036fdcbc6ff` built commit `252cfe9` successfully without Stackbit.
   - Netlify's Git integration currently auto-builds only `master`; use an explicit branch deploy for feature-branch previews until branch deploys or PR previews are intentionally enabled.
4. Production promotion is complete.
   - Production points to verified design-system deploy `6a9fcb7eea64dbfc233d1cbc`, built from commit `7d032b4` on the Gatsby 5 baseline.
   - Immediate rollback deploy `6a9fc420a8f14040d7b3b073`, earlier repository-owned deploys, and the original 2021 deploy `60b0048f729f6c21f4807364` remain available.
   - Production QA passed for historical posts, working avatar, metadata, discovery files, contact validation, internal navigation, dead-link cleanup, and responsive layout.

## Priority 0 — Protect production before changing anything
1. Confirm the current production source of truth. **Completed.**
   - Netlify deployment source, build settings, and rollback evidence are recorded in the deployment workflow findings above.
   - Stackbit is not required: all post sources are committed and the successful repository-owned Netlify build ran without a content pull.
   - Netlify builds with `npm run build` and publishes `public`; no Stackbit build environment variable is needed.
2. Make the current site reproducible. **Completed.**
   - `README.md` documents the exact clean local/Netlify production build using Node 18, `npm ci`, Gatsby clean, and `npm run build`.
   - All three historical post sources are committed under `src/pages/posts/`.
   - The obsolete `stackbit-build.sh`, including its checkout-path assumption and content rewrite, has been removed rather than retained as a second build path.

## Priority 1 — Stabilize the repo and build pipeline
3. Clean up stale build/config drift. **Completed.**
   - Netlify has one repository-owned build path: `npm run build` from `netlify.toml`.
   - The obsolete remote integration files `stackbit-build.sh`, `ssg-build.sh`, and `stackbit.yaml` have been removed.
   - Stackbit's remote content/build service is retired. The similarly named Gatsby stylesheet and menu plugins remain because the current site build consumes their output.
4. Add baseline CI. **Completed.**
   - GitHub Actions installs with `npm ci`, cleans Gatsby, and runs the production build on push/PR.
   - The workflow reads Node from `.nvmrc` and uses npm's lockfile cache for reproducible builds.
   - GitHub Actions run `34201016997` passed all install, clean, and production-build steps for commit `1e75d88`; current `checkout@v7` and `setup-node@v7` produced no runner annotations.

## Priority 2 — Reduce security risk
5. Remove dangerous content script execution. **Completed.**
   - `src/utils/htmlToReact.js` drops parsed `<script>` nodes instead of rendering them.
   - Content rendering contains no debug logging.
   - Content remains restricted to repository-owned Markdown; broader HTML sanitization is deferred until the framework migration can replace the legacy parser cleanly.
6. Modernize dependencies in a staged way. **Completed.**
   - Upgraded to Gatsby 5.16.1, React/ReactDOM 18.3.1, and compatible current official Gatsby plugins.
   - Replaced `node-sass` and `node-sass-utils` with Dart Sass 1.98.0; the repository-owned stylesheet plugin uses Dart Sass's modern compile API.
   - Replaced `react-html-parser` with `html-react-parser` while retaining script-node removal.
   - Internalized the Stackbit menus plugin and replaced its unsupported page-node mutation with `deletePage`/`createPage` updates that preserve existing page data and context.
   - Regenerated `package-lock.json` with Node 18.20.8/npm 10.8.2. Under that runtime, `npm ci`, Gatsby clean, and the production build pass; static artifact checks cover all six routes, navigation, CSS, metadata, discovery files, and contact form markup.
   - GitHub Actions run `34198118434`, hosted Netlify preview QA, and post-promotion production QA all passed for commit `dacf1f7`.
7. Re-run audit after framework upgrades. **Completed.**
   - `npm audit` improved from 203 vulnerabilities (13 low, 68 moderate, 95 high, 27 critical) to 47 (7 low, 21 moderate, 19 high, 0 critical).
   - Remaining vulnerable direct dependency paths are Gatsby and its official plugins (`gatsby`, `gatsby-plugin-react-helmet`, `gatsby-source-filesystem`, and `gatsby-transformer-remark`) plus legacy direct `marked`; npm currently offers no non-breaking Gatsby 5 remediation, and one-off forced transitive changes were intentionally avoided.

## Priority 3 — Fix code and content bugs
8. Fix brittle links and routing. **Completed.**
   - Confirmed repository source already uses canonical `/blog/` routes and contains no `blog/index.html` references.
   - Hardened and documented `safePrefix`, `toUrl`, `getPage`, and `getPages`: invalid or missing route data now returns stable caller-safe values, while valid exact lookups and Gatsby path prefixes retain their existing behavior.
   - Removed the stale relative-resolution TODOs; lookups are explicitly repository-relative because no current-page argument exists.
   - Added focused Node test coverage for invalid inputs, path shape, root and missing routes, fragments, external URLs, exact lookups, and Gatsby path-prefix behavior.
   - All 7 routing tests, GitHub Actions run `34200046732`, hosted preview navigation, and post-promotion production navigation passed for commit `c83d50d`.
9. Fix stale content/config issues.
   - **Completed:** `src/data/author.json` already uses `danial@danial.io`; no placeholder email remains.
   - **Completed:** reviewed public external links, retained working HTTPS and intentional Wayback destinations, and removed the dead Cheap Cheap Fares link while preserving the historical project entry.
   - ~~Correct the `canonical_url` field type in `stackbit.yaml`.~~ Retired with the obsolete Stackbit CMS schema; there is no active Stackbit model to correct.
   - **Needs owner input:** refresh the project roster/statuses and add newer posts; the repository has no authoritative facts after 2021.
   - **Completed:** homepage project/contact links now use canonical internal routes, and working external project links were verified at their current HTTPS destinations.
10. Verify Netlify contact form behavior. **Completed, except approved live submission.**
   - The form is present in built HTML and detected by Netlify as `contact`.
   - Client-side required/email validation blocks empty and malformed submissions from reaching Netlify's success page.
   - A valid production submission remains intentionally untested until approval is available to create a real Netlify form entry and notification.

## Priority 4 — Improve SEO, metadata, and site quality
11. Add modern SEO defaults. **Completed.**
   - Added page descriptions, Open Graph tags, Twitter card tags, and canonical URLs for all pages.
   - Added favicon/app icon/theme-color support plus valid `robots.txt` and `sitemap.xml` discovery files.
   - Hosted preview and production browser QA verified the metadata and discovery endpoints.
12. Add quality checks. **Completed.**
   - Added a dependency-free generated-artifact check for broken internal links, missing local image/static targets, and missing fragments; focused fixtures prove both success and actionable failure behavior.
   - CI now runs all Node tests before building and validates the generated `public/` artifact afterward.
   - Added low-noise monthly Dependabot checks for npm and GitHub Actions, grouped to minor/patch updates with conservative pull-request limits; major updates remain deliberate migrations.
   - Lighthouse/accessibility automation remains optional because browser setup, audit variability, and runtime cost outweigh its current value for six static routes; browser QA remains in the release gate.
   - CodeQL remains deferred because the small static first-party JavaScript surface provides limited incremental signal relative to workflow cost; dependency audit, script-node filtering, and build/link tests cover the current higher-value risks.
   - All 12 tests, generated-artifact checks, GitHub Actions run `34203361381`, hosted preview QA, and post-promotion production QA passed for commit `8b15b92`.

## Priority 5 — Improve look and feel
13. Refresh the design system. **Completed.**
   - Replaced the remote webfont with a fast system stack and introduced reusable typography, spacing, width, radius, color, and focus tokens in the existing Sass system.
   - Adopted a restrained charcoal/white foundation with teal and muted-red accents, stronger hierarchy, accessible contrast, and consistent 6px radii.
   - Modernized shared header/navigation, footer, links/buttons, forms, tables, prose, and post-feed styling while preserving all routes, content, assets, and behavior.
   - Removed legacy browser-prefix clutter and obsolete palette overrides from the compiled stylesheet; touched Sass map helpers now use the module API.
   - Local browser QA passed across home, blog, contact, prose-post, and project-table surfaces at desktop and responsive widths, including menu interaction, form validation/focus, loaded imagery, and no page-level overflow or console errors.
   - GitHub Actions run `34206213669`, hosted preview QA, and post-promotion production QA passed for commit `7d032b4`.
14. Improve key UX surfaces. **Completed, except owner-supplied content.**
   - Added a compact primary/secondary CTA hierarchy to the homepage and a shared, scan-friendly post-feed treatment with prominent dates, excerpts, and 44px title targets.
   - Improved blog archive hierarchy, mobile navigation labeling, expanded state, focus trapping/return, Escape handling, and route-close behavior.
   - Reworked the footer into semantic project navigation with the existing social link, and made Markdown tables focusable, contained keyboard/touch scrollers.
   - Added repository-backed email/Twitter contact options plus inline, ARIA-connected required/email validation states without changing Netlify form detection or submission behavior.
   - Local desktop/responsive browser QA passed for hero balance, post scanning, target sizes, footer wrapping, menu keyboard behavior, validation error/correction states, table keyboard scrolling, and no page-level overflow or console errors.
   - **Needs owner input:** richer featured-project/current-focus/credibility content, response expectations, newer project statuses, and additional social links have no current authoritative source in the repository.
15. Improve assets and polish.
   - Replace the confirmed-broken remote profile and post image sources with controlled assets.
   - Optimize images and visual consistency.
   - Remove unnecessary public-site editing/widget scripts if they are no longer needed in production.
   - Add broader social/profile links where appropriate (e.g. GitHub, LinkedIn, X) and tighten branding consistency.

## Suggested execution order
1. Confirm Netlify/Stackbit production setup.
2. Make the build reproducible.
3. Add CI.
4. Remove dangerous script rendering.
5. Upgrade Gatsby/React/Sass stack.
6. Fix routing/content/config bugs.
7. Add SEO and quality checks.
8. Modernize design and UX.

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
   - Use Node 14 from `.nvmrc`, then run `npx --no-install gatsby clean`, `npm run build`, and `npm run serve`.
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
   - Production points to deploy `6a9f8e65b2925036fdcbc6ff` at commit `252cfe9`; rollback deploy `60b0048f729f6c21f4807364` remains available.
   - Production QA passed for historical posts, working avatar, metadata, discovery files, contact validation, and desktop/mobile layout.

## Priority 0 — Protect production before changing anything
1. Confirm the current production source of truth. **Completed.**
   - Netlify deployment source, build settings, and rollback evidence are recorded in the deployment workflow findings above.
   - Stackbit is not required: all post sources are committed and the successful repository-owned Netlify build ran without a content pull.
   - Netlify builds with `npm run build` and publishes `public`; no Stackbit build environment variable is needed.
2. Make the current site reproducible. **Completed.**
   - `README.md` documents the exact clean local/Netlify production build using Node 14, `npm ci`, Gatsby clean, and `npm run build`.
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
   - GitHub Actions run `34193965720` passed all install, clean, and production-build steps for commit `0a5e804`.

## Priority 2 — Reduce security risk
5. Remove dangerous content script execution. **Completed.**
   - `src/utils/htmlToReact.js` drops parsed `<script>` nodes instead of rendering them.
   - Content rendering contains no debug logging.
   - Content remains restricted to repository-owned Markdown; broader HTML sanitization is deferred until the framework migration can replace the legacy parser cleanly.
6. Modernize dependencies in a staged way.
   - Upgrade to a supported Gatsby version.
   - Replace `node-sass` with `sass`.
   - Upgrade React and related Gatsby plugins to compatible supported versions.
   - Regenerate `package-lock.json` with a modern npm.
7. Re-run audit after framework upgrades.
   - Use the framework migration to eliminate the bulk of the 197 reported vulnerabilities.
   - Avoid one-off patching of deeply transitive legacy packages unless required to unblock builds.

## Priority 3 — Fix code and content bugs
8. Fix brittle links and routing.
   - Change `blog/index.html` references to canonical internal routes like `/blog/`.
   - Review `safePrefix`, `toUrl`, `getPage`, and `getPages` behavior.
   - Add guardrails for missing pages instead of hard crashes where appropriate.
9. Fix stale content/config issues.
   - Replace placeholder `email@example.com` in `src/data/author.json`.
   - Review outdated external `http://` links and switch to `https://` where available.
   - ~~Correct the `canonical_url` field type in `stackbit.yaml`.~~ Retired with the obsolete Stackbit CMS schema; there is no active Stackbit model to correct.
   - Refresh stale homepage/blog/projects content (recent posts stop in 2021; projects page/tally is outdated).
   - Review and repair brittle external project links (e.g. dead or redirected portfolio links).
10. Verify Netlify contact form behavior.
   - Confirm the form is actually present in the built HTML and being detected by Netlify.
   - If not, update implementation so static form detection works reliably.
   - Add client-side required/email validation and confirm an empty form cannot reach Netlify's success page.

## Priority 4 — Improve SEO, metadata, and site quality
11. Add modern SEO defaults.
   - Meta description.
   - Open Graph tags.
   - Twitter card tags.
   - Canonical URLs for all pages.
   - Favicon/app icon/theme-color support.
   - Add `robots.txt` and `sitemap.xml`.
12. Add quality checks.
   - Link checking.
   - Optional Lighthouse/accessibility checks.
   - Optional CodeQL / security scanning.
   - Dependabot or Renovate for ongoing updates.

## Priority 5 — Improve look and feel
13. Refresh the design system.
   - Improve typography, spacing, and contrast.
   - Modernize color usage and visual hierarchy.
   - Reduce template-era styling.
14. Improve key UX surfaces.
   - Stronger homepage hero and clearer CTA.
   - Better recent-posts presentation.
   - Cleaner blog list cards and metadata.
   - Better mobile navigation and responsiveness.
   - Improved footer/social/contact presentation.
   - Add a richer homepage structure: featured projects, current focus/now, credibility highlights, and clearer next actions.
   - Make the contact page more useful with alternate contact paths, response expectations, and better form UX/validation states.
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

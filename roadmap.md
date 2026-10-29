# Clippza MVP
- [x] Inspect and preserve existing screens and identity.
- [x] Apply minimal schema, signup roles, ownership guards, and RLS.
- [x] Complete authentication, campaigns, submissions, and manual admin review.
- [x] Verify access grants, basic security scan, validation tests, preview, and public mobile flows.
- [ ] Verify signed-in Client → Clipper → Admin workflow: blocked until real users sign up and the owner provisions a reviewer; no fake accounts or admin created.
- [x] Document remaining owner-controlled setup.
- [x] Remediate the 12 scoped dependency advisories with targeted package/lockfile updates and run existing checks; unrelated development-tool advisories and pre-existing lint formatting failures are reported, not changed.
- [x] Patch compatible development-tooling dependencies; seven tests, preview/typecheck, and clean 53-package production scan verified.
- [ ] Resolve dev-only esbuild GHSA-67mh-4wv8-2f99: blocked by latest stable drizzle-kit → legacy esm-loader → core-utils requiring ~0.18.20; no forced override or prerelease migration-tool upgrade applied.
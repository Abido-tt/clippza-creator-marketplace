# Clippza review setup

## Ready
- Landing identity preserved. Email/password signup and sign-in are enabled; email confirmation remains on.
- Role-specific overview, campaign creation/editing/status management, open discovery, clip submission/tracking, and manual admin review are connected.
- Two schema migrations include the complete baseline and tighter profile/link guards. No demo people, campaign rows, or admin accounts were added.

## Access rules
- Profiles: read own; update display name only.
- Roles: read own; no user inserts, updates, or deletes. Signup trigger accepts only client/clipper; admin metadata is reduced to clipper, and later metadata changes do not change roles.
- Campaigns: clients create/manage own; ownership/identity/timestamps are protected. Signed-in users discover open campaigns. Existing participants can still read their submitted campaign when it closes; unrelated users cannot see hidden campaigns. Admins can read campaign context for review.
- Submissions: clippers submit only to open campaigns and read own. Owners read related submissions. Only database-authorized admins can update review fields; identity, owner, URL, and original note are immutable. Review actor/time are set by the database.
- Review endpoint revalidates session and admin role, accepts only approval/rejection, requires a note, and prevents stale pending-queue decisions.
- Views and proposed rewards are manual noncash records. No payments, wallet, payout, or analytics verification exists.

## Verification and next owner steps
- Validation and route tests pass. Basic backend scan reports no findings; grants, RLS, and constraints were inspected directly. Desktop/mobile landing and signup render without browser errors.
- No auth users exist, so signed-in campaign/submission/review flows and actual email delivery cannot yet be verified without creating accounts, which this request forbids faking.
- Sign up with real Client and Clipper emails, confirm them, and sign in through the preview. Then review a campaign → submitted clip → manual review together.
- Choose a real reviewer account. The workspace owner must assign its admin role through a privileged owner-controlled database action after confirming the user identity. There is deliberately no browser admin-assignment feature.
- Nothing has been published or deployed.
<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep private screens under the managed `_authenticated` layout; database RLS and immutable-field triggers enforce access independently of navigation.
- Store signup-selected client/clipper roles in a protected roles table through a signup trigger; admin is provisioned only through an owner-controlled privileged database action.
- Admin review uses an authenticated server function and database role validation; views and rewards remain manual, noncash records.
- Keep schema setup in an idempotent baseline migration so a remix with existing empty tables and a new database both work.
- Use the public, non-nested `/auth/callback` route for signup email returns; let the auth SDK consume URL credentials and revalidate the user before showing confirmation success.
- Keep signup-only password and auth form validation in `src/lib/auth-validation.ts` so live feedback and submit validation share the same rules without changing sign-in credentials.
- Theme is a `.dark` class on <html> set by an inline head script before paint and toggled by ThemeToggle; preference logic lives in `src/lib/theme.ts` (no theme package).

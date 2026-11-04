# Clippza Creator Marketplace

Build the first usable MVP of Clippza, a polished marketplace connecting clients who run short-form video clipping campaigns with clippers who publish clips and submit their public video URLs. This is a brand-new project; create the product foundation carefully.

PRODUCT SCOPE
- Payment gateway onboarding is on hold. Do not implement payment collection, payout, withdrawal, wallet, or withdrawable balances. Any reward is a proposed/approved in-app reward record only, clearly labeled as pending/manual review and not cash available for withdrawal.
- Build real authentication and role-based experiences for Client, Clipper, and Admin. Sign-up lets a user choose Client or Clipper. Admin is not selectable in public sign-up; keep admin privileges server-authorized.
- Clients can create campaigns with title, brief, platform, optional reference URL, reward rate/description, target views, and campaign status. They can see and manage their own campaigns and submissions.
- Clippers can browse open campaigns, see campaign details, and submit a public clip/video URL with an optional note. They can track submission status.
- Admin can review submissions, record reported views and a proposed reward amount, then approve or reject with a review note. Approval means manually reviewed in-app reward only; never imply verified platform analytics or payout.
- Use a clear review workflow: submitted, approved, rejected. Ensure server/database authorization prevents users from changing another user's records or self-assigning admin.
- If the full secure backend cannot be completed in this first pass, build the polished responsive UI with honest demo/sample data and leave clear integration points; do not fake security or claim real authentication/data persistence.

DESIGN
- Create a distinctive Clippza visual identity for a creator marketplace: dark ink/navy foundation, vivid lime accent, crisp white surfaces, bold editorial typography, subtle video-frame/clip motifs. Make it feel premium, energetic, and trustworthy; not a generic dashboard template.
- Responsive desktop and mobile layouts, accessible contrast, clear Arabic/English friendly structure but default interface language English.
- Landing page explains the two-sided marketplace and has clear Join as Client / Join as Clipper calls to action.
- Add authentication screens, role-based dashboard navigation, campaign list/detail/create screens, clip submission form and list, and a clean Admin review queue.
- Show believable empty states and a small, visibly labeled demo mode only where backend setup is unavailable.
- No payment logos, checkout, payout controls, or cash balance cards.

Implement the initial app in this Lovable project. Connect its built-in Supabase database/auth if available; before creating schema, keep the model minimal and apply appropriate row-level security. Do not publish or deploy the project.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ce101530-b2db-4150-a990-e168dc861c66).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

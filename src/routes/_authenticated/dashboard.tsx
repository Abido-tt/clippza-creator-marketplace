import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/AppShell";
import { RewardNotice } from "@/components/StatusBadge";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Clippza" }, { name: "description", content: "Your Clippza overview." }, { property: "og:title", content: "Dashboard — Clippza" }, { property: "og:description", content: "Your Clippza overview." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { me } = useMe();
  return (
    <div>
      <PageHeader kicker="Overview" title={`Hi, ${me?.name ?? ""}`} />
      <div className="grid gap-4 md:grid-cols-2">
        {me?.isClient && (
          <div className="surface-card p-6">
            <h2 className="font-display text-xl font-bold">Run a campaign</h2>
            <p className="mt-1 text-sm text-muted-foreground">Post a brief and open it to clippers.</p>
            <Button asChild variant="lime" className="mt-4"><Link to="/campaigns/new">New campaign</Link></Button>
          </div>
        )}
        {me?.isClipper && (
          <div className="surface-card p-6">
            <h2 className="font-display text-xl font-bold">Find a campaign</h2>
            <p className="mt-1 text-sm text-muted-foreground">Browse open briefs and submit your clip links.</p>
            <Button asChild variant="lime" className="mt-4"><Link to="/campaigns">Browse campaigns</Link></Button>
          </div>
        )}
        {me?.isAdmin && (
          <div className="surface-card p-6">
            <h2 className="font-display text-xl font-bold">Review queue</h2>
            <p className="mt-1 text-sm text-muted-foreground">Approve or reject submitted clips.</p>
            <Button asChild className="mt-4"><Link to="/admin">Open queue</Link></Button>
          </div>
        )}
      </div>
      <RewardNotice className="mt-8" />
    </div>
  );
}

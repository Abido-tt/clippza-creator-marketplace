import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/AppShell";
import { RewardNotice } from "@/components/StatusBadge";
import { useMe } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/lib/data";
import { QueryFeedback } from "@/components/QueryFeedback";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Clippza" }, { name: "description", content: "Your Clippza overview." }, { property: "og:title", content: "Dashboard — Clippza" }, { property: "og:description", content: "Your Clippza overview." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { me } = useMe();
  const { data: summary, error, refetch, isLoading } = useQuery({
    queryKey: ["overview", me?.id], enabled: !!me,
    queryFn: async () => {
      if (!me) throw new Error("Sign in to view your overview");
      if (me.isAdmin) {
        const rows = unwrap(await supabase.from("submissions").select("status")) ?? [];
        return [{ label: "Pending review", value: rows.filter(s => s.status === "submitted").length }, { label: "Approved", value: rows.filter(s => s.status === "approved").length }, { label: "Rejected", value: rows.filter(s => s.status === "rejected").length }];
      }
      if (me.isClient) {
        const rows = unwrap(await supabase.from("campaigns").select("status").eq("client_id", me.id)) ?? [];
        return [{ label: "Campaigns", value: rows.length }, { label: "Open", value: rows.filter(c => c.status === "open").length }, { label: "Drafts", value: rows.filter(c => c.status === "draft").length }];
      }
      const rows = unwrap(await supabase.from("submissions").select("status").eq("clipper_id", me.id)) ?? [];
      return [{ label: "Submissions", value: rows.length }, { label: "In review", value: rows.filter(s => s.status === "submitted").length }, { label: "Approved", value: rows.filter(s => s.status === "approved").length }];
    },
  });
  return (
    <div>
      <PageHeader kicker="Overview" title={`Hi, ${me?.name ?? ""}`} />
      {error ? <QueryFeedback error={error} retry={refetch} /> : isLoading ? <p role="status">Loading overview…</p> : <div className="mb-8 grid grid-cols-3 gap-3 border-y py-5">{summary?.map(item => <div key={item.label}><p className="text-xs text-muted-foreground">{item.label}</p><p className="font-display text-3xl font-bold">{item.value}</p></div>)}</div>}
      {me && !me.roles.length && <p role="alert">Your account has no assigned role. The workspace owner needs to review its setup.</p>}
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

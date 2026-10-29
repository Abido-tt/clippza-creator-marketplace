import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { useMe } from "@/lib/auth";
import { fmtNum, platformLabel } from "@/lib/format";
import { QueryFeedback } from "@/components/QueryFeedback";

export const Route = createFileRoute("/_authenticated/campaigns/")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { title: "Campaigns — Clippza" }, { name: "description", content: "Clipping campaigns on Clippza." }, { property: "og:title", content: "Campaigns — Clippza" }, { property: "og:description", content: "Clipping campaigns on Clippza." }] }),
  component: Campaigns,
});

function Campaigns() {
  const { me } = useMe();
  const mine = !!me?.isClient && !me?.isAdmin;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["campaigns", mine, me?.id],
    enabled: !!me,
    queryFn: async () => {
      if (!me) throw new Error("Sign in to view campaigns");
      let q = supabase.from("campaigns").select("*").order("created_at", { ascending: false });
      q = mine ? q.eq("client_id", me.id) : me.isAdmin ? q : q.eq("status", "open");
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
  return (
    <div>
      <PageHeader kicker="Campaigns" title={mine ? "My campaigns" : "Open campaigns"}
        action={me?.isClient && <Button asChild variant="lime"><Link to="/campaigns/new">New campaign</Link></Button>} />
      {error ? <QueryFeedback error={error} retry={refetch} /> : isLoading ? <p role="status" className="text-muted-foreground">Loading…</p> : !data?.length ? (
        <EmptyState title={mine ? "No campaigns yet" : "No open campaigns right now"}
          body={mine ? "Create your first brief to start receiving clips." : "Check back soon — new briefs appear here when clients open them."}
          action={mine && <Button asChild><Link to="/campaigns/new">Create campaign</Link></Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((c) => (
            <Link key={c.id} to="/campaigns/$id" params={{ id: c.id }} className="surface-card block p-5 transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between"><span className="font-mono text-xs uppercase text-muted-foreground">{platformLabel(c.platform)}</span><StatusBadge status={c.status} /></div>
              <h3 className="mt-3 font-display text-xl font-bold">{c.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.brief}</p>
              <p className="mt-4 text-sm">Target <b>{fmtNum(c.target_views)}</b> views{c.reward_rate != null && <> · Proposed rate <b>{c.reward_rate}</b></>}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

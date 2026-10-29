import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { RewardNotice } from "@/components/StatusBadge";
import { SubmissionRow } from "@/components/SubmissionRow";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/submissions")({
  head: () => ({ meta: [{ title: "My submissions — Clippza" }, { name: "description", content: "Track your clip submissions." }, { property: "og:title", content: "My submissions — Clippza" }, { property: "og:description", content: "Track your clip submissions." }] }),
  component: Subs,
});

function Subs() {
  const { me } = useMe();
  const { data, isLoading } = useQuery({
    queryKey: ["my-subs", me?.id],
    enabled: !!me,
    queryFn: async () => (await supabase.from("submissions").select("*, campaigns(title)").eq("clipper_id", me!.id).order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div>
      <PageHeader kicker="Clipper" title="My submissions" />
      <RewardNotice className="mb-6" />
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : !data?.length ? (
        <EmptyState title="Nothing submitted yet" body="Pick an open campaign, publish your clip, then submit its public link." action={<Button asChild variant="lime"><Link to="/campaigns">Browse campaigns</Link></Button>} />
      ) : <div className="space-y-3">{data.map((s) => <SubmissionRow key={s.id} s={s} title={s.campaigns?.title} />)}</div>}
    </div>
  );
}

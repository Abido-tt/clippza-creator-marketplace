import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { RewardNotice } from "@/components/StatusBadge";
import { SubmissionRow } from "@/components/SubmissionRow";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Review queue — Clippza" }, { name: "description", content: "Admin submission review." }, { property: "og:title", content: "Review queue — Clippza" }, { property: "og:description", content: "Admin submission review." }] }),
  component: Admin,
});

function Admin() {
  const { me } = useMe();
  const [tab, setTab] = useState<"submitted" | "approved" | "rejected">("submitted");
  const { data } = useQuery({
    queryKey: ["admin-subs", tab],
    enabled: !!me?.isAdmin,
    queryFn: async () => (await supabase.from("submissions").select("*, campaigns(title)").eq("status", tab).order("created_at")).data ?? [],
  });
  if (me && !me.isAdmin) return <EmptyState title="Admins only" body="This area is restricted to reviewers." />;
  return (
    <div>
      <PageHeader kicker="Admin" title="Review queue" />
      <div className="mb-6 flex gap-2">
        {(["submitted", "approved", "rejected"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)} className="capitalize">{t === "submitted" ? "Pending" : t}</Button>
        ))}
      </div>
      <RewardNotice className="mb-6" />
      {!data?.length ? <EmptyState title="Queue is clear" body="No submissions in this state." /> : (
        <div className="space-y-3">{data.map((s) => (
          <SubmissionRow key={s.id} s={s} title={s.campaigns?.title}>{s.status === "submitted" && <Review id={s.id} />}</SubmissionRow>
        ))}</div>
      )}
    </div>
  );
}

function Review({ id }: { id: string }) {
  const qc = useQueryClient();
  const [views, setViews] = useState("");
  const [reward, setReward] = useState("");
  const [note, setNote] = useState("");
  async function decide(status: "approved" | "rejected") {
    const { error } = await supabase.from("submissions").update({
      status, review_note: note.trim() || null,
      reported_views: views ? Number(views) : null, proposed_reward: reward ? Number(reward) : null,
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Submission ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-subs"] });
  }
  return (
    <div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
      <Input type="number" min={0} placeholder="Reported views" value={views} onChange={(e) => setViews(e.target.value)} aria-label="Reported views" />
      <Input type="number" min={0} step="0.01" placeholder="Proposed in-app reward" value={reward} onChange={(e) => setReward(e.target.value)} aria-label="Proposed reward" />
      <Textarea className="sm:col-span-2" rows={2} placeholder="Review note" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Review note" />
      <div className="flex gap-2 sm:col-span-2">
        <Button variant="lime" onClick={() => decide("approved")}>Approve</Button>
        <Button variant="destructive" onClick={() => decide("rejected")}>Reject</Button>
      </div>
    </div>
  );
}

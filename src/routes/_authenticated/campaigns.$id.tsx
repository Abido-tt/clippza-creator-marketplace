import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, EmptyState } from "@/components/AppShell";
import { StatusBadge, RewardNotice } from "@/components/StatusBadge";
import { SubmissionRow } from "@/components/SubmissionRow";
import { useMe } from "@/lib/auth";
import { fmtNum, platformLabel, isHttpUrl } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";
import { CampaignEditor } from "@/components/CampaignEditor";
import { QueryFeedback } from "@/components/QueryFeedback";
import { unwrap } from "@/lib/data";

type CStatus = Database["public"]["Enums"]["campaign_status"];

export const Route = createFileRoute("/_authenticated/campaigns/$id")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { title: "Campaign — Clippza" }, { name: "description", content: "Campaign brief and submissions." }, { property: "og:title", content: "Campaign — Clippza" }, { property: "og:description", content: "Campaign brief and submissions." }] }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { me } = useMe();
  const qc = useQueryClient();
  const { data: c, isLoading, error, refetch } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => unwrap(await supabase.from("campaigns").select("*").eq("id", id).maybeSingle()),
  });
  const { data: subs, error: subsError, isLoading: subsLoading, refetch: retrySubs } = useQuery({
    queryKey: ["campaign-subs", id, me?.id],
    enabled: !!me,
    queryFn: async () => unwrap(await supabase.from("submissions").select("*").eq("campaign_id", id).order("created_at", { ascending: false })) ?? [],
  });
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  if (error) return <QueryFeedback error={error} retry={refetch} />;
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!c) return <EmptyState title="Campaign not found" body="It may be a draft or no longer available." />;
  const owner = c.client_id === me?.id;

  async function setStatus(status: CStatus) {
    if (changingStatus) return;
    setChangingStatus(true);
    const { error } = await supabase.from("campaigns").update({ status }).eq("id", id);
    setChangingStatus(false);
    if (error) return void toast.error(error.message);
    toast.success(`Campaign ${status}`);
    qc.invalidateQueries();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!me?.isClipper) return void toast.error("A Clipper account is required");
    if (!isHttpUrl(url)) return void toast.error("Enter a public URL starting with http(s)://");
    setBusy(true);
    const { error } = await supabase.from("submissions").insert({ campaign_id: id, clipper_id: me.id, clip_url: url.trim(), note: note.trim() || null });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Clip submitted for review");
    setUrl(""); setNote("");
    qc.invalidateQueries();
  }

  return (
    <div>
      <PageHeader kicker={platformLabel(c.platform)} title={c.title} action={<StatusBadge status={c.status} />} />
      <div className="space-y-4 border-b pb-6">
        <p className="whitespace-pre-wrap">{c.brief}</p>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div><p className="text-muted-foreground">Target views</p><p className="font-display text-xl font-bold">{fmtNum(c.target_views)}</p></div>
          <div><p className="text-muted-foreground">Proposed rate</p><p className="font-display text-xl font-bold">{c.reward_rate ?? "—"}</p></div>
          {c.reference_url && <div><p className="text-muted-foreground">Reference</p><a className="underline" href={c.reference_url} target="_blank" rel="noopener noreferrer nofollow">Open link</a></div>}
        </div>
        {c.reward_description && <p className="text-sm">{c.reward_description}</p>}
        <RewardNotice />
        {owner && (
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {(["draft", "open", "paused", "closed"] as const).map((s) => (
              <Button key={s} size="sm" disabled={changingStatus || c.status === s} variant={c.status === s ? "default" : "outline"} onClick={() => setStatus(s)} className="capitalize">{s}</Button>
            ))}
            <Button size="sm" variant="outline" onClick={() => setEditing(!editing)}>{editing ? "Cancel editing" : "Edit campaign"}</Button>
          </div>
        )}
        {owner && editing && <CampaignEditor campaign={c} close={() => setEditing(false)} saved={() => { qc.invalidateQueries(); }} />}
      </div>

      {me?.isClipper && c.status === "open" && (
        <form onSubmit={submit} className="mt-6 space-y-4 border-b pb-6">
          <h2 className="font-display text-xl font-bold">Submit your clip</h2>
          <div className="space-y-1.5"><Label htmlFor="u">Public clip URL</Label><Input id="u" type="url" required maxLength={500} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.tiktok.com/@you/video/…" /></div>
          <div className="space-y-1.5"><Label htmlFor="n">Note (optional)</Label><Textarea id="n" maxLength={1000} rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <Button type="submit" variant="lime" disabled={busy}>{busy ? "Submitting…" : "Submit for review"}</Button>
        </form>
      )}

      <h2 className="mb-3 mt-10 font-display text-2xl font-bold">{owner || me?.isAdmin ? "Submissions" : "Your submissions"}</h2>
      {subsError ? <QueryFeedback error={subsError} retry={retrySubs} /> : subsLoading ? <p role="status">Loading submissions…</p> : !subs?.length ? <EmptyState title="No submissions yet" body="Clips submitted to this campaign will appear here." /> : (
        <div className="space-y-3">{subs.map((s) => <SubmissionRow key={s.id} s={s} />)}</div>
      )}
    </div>
  );
}

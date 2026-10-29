import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/AppShell";
import { RewardNotice } from "@/components/StatusBadge";
import { useMe } from "@/lib/auth";
import { PLATFORMS, isHttpUrl } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Platform = Database["public"]["Enums"]["clip_platform"];
type CStatus = Database["public"]["Enums"]["campaign_status"];

export const Route = createFileRoute("/_authenticated/campaigns/new")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { title: "New campaign — Clippza" }, { name: "description", content: "Create a clipping campaign." }, { property: "og:title", content: "New campaign — Clippza" }, { property: "og:description", content: "Create a clipping campaign." }] }),
  component: NewCampaign,
});

const sel = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

function NewCampaign() {
  const { me } = useMe();
  const navigate = useNavigate();
  const [f, setF] = useState({ title: "", brief: "", platform: "tiktok" as Platform, reference_url: "", reward_rate: "", reward_description: "", target_views: "", status: "open" as CStatus });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  if (me && !me.isClient) return <p className="text-muted-foreground">Only Client accounts can create campaigns.</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!me?.isClient) return void toast.error("A Client account is required");
    if (f.reference_url && !isHttpUrl(f.reference_url)) return void toast.error("Reference URL must start with http(s)://");
    setBusy(true);
    const { data, error } = await supabase.from("campaigns").insert({
      client_id: me.id, title: f.title.trim(), brief: f.brief.trim(), platform: f.platform,
      reference_url: f.reference_url.trim() || null, reward_rate: f.reward_rate ? Number(f.reward_rate) : null,
      reward_description: f.reward_description.trim(), target_views: f.target_views ? Number(f.target_views) : null, status: f.status,
    }).select("id").single();
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success("Campaign created");
    navigate({ to: "/campaigns/$id", params: { id: data.id } });
  }

  return (
    <div>
      <PageHeader kicker="Client" title="New campaign" />
      <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2"><Label htmlFor="t">Title</Label><Input id="t" required minLength={3} maxLength={120} value={f.title} onChange={set("title")} /></div>
        <div className="space-y-1.5 md:col-span-2"><Label htmlFor="b">Brief</Label><Textarea id="b" required minLength={10} maxLength={4000} rows={5} value={f.brief} onChange={set("brief")} /></div>
        <div className="space-y-1.5"><Label htmlFor="p">Platform</Label><select id="p" className={sel} value={f.platform} onChange={set("platform")}>{PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
        <div className="space-y-1.5"><Label htmlFor="s">Status</Label><select id="s" className={sel} value={f.status} onChange={set("status")}>{["draft", "open", "paused", "closed"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        <div className="space-y-1.5 md:col-span-2"><Label htmlFor="r">Reference URL (optional)</Label><Input id="r" type="url" value={f.reference_url} onChange={set("reference_url")} placeholder="https://" /></div>
        <div className="space-y-1.5"><Label htmlFor="rr">Proposed in-app rate (per 1K views)</Label><Input id="rr" type="number" min={0} step="0.01" value={f.reward_rate} onChange={set("reward_rate")} /></div>
        <div className="space-y-1.5"><Label htmlFor="tv">Target views</Label><Input id="tv" type="number" min={1} max={2147483647} step={1} value={f.target_views} onChange={set("target_views")} /></div>
        <div className="space-y-1.5 md:col-span-2"><Label htmlFor="rd">Reward description</Label><Textarea id="rd" rows={2} maxLength={500} value={f.reward_description} onChange={set("reward_description")} /></div>
        <RewardNotice className="md:col-span-2" />
        <div className="md:col-span-2"><Button type="submit" variant="lime" size="lg" disabled={busy}>{busy ? "Saving…" : "Create campaign"}</Button></div>
      </form>
    </div>
  );
}

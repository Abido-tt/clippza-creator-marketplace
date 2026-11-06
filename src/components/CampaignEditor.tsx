import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLATFORMS, isHttpUrl } from "@/lib/format";
import { isRewardLockedError } from "@/lib/validation";

export function CampaignEditor({ campaign, close, saved, rewardLocked = false }: { campaign: Tables<"campaigns">; rewardLocked?: boolean; close: () => void; saved: () => void }) {
  const [f, setF] = useState({ title: campaign.title, brief: campaign.brief, platform: campaign.platform, reference_url: campaign.reference_url ?? "", reward_rate: campaign.reward_rate?.toString() ?? "", target_views: campaign.target_views?.toString() ?? "", reward_description: campaign.reward_description });
  const [busy, setBusy] = useState(false);
  const change = (key: keyof typeof f, value: string) => setF(prev => ({ ...prev, [key]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.reference_url && !isHttpUrl(f.reference_url)) return void toast.error("Enter a public reference URL");
    setBusy(true);
    try {
      const { reward_rate, reward_description, ...rest } = f;
      const { error } = await supabase.from("campaigns").update({ ...rest, ...(rewardLocked ? {} : { reward_description, reward_rate: reward_rate ? Number(reward_rate) : null }), title: f.title.trim(), brief: f.brief.trim(), reference_url: f.reference_url.trim() || null, target_views: f.target_views ? Number(f.target_views) : null }).eq("id", campaign.id);
      if (isRewardLockedError(error)) return void toast.error("Reward terms are locked because a clip has already been submitted.");
      if (error) throw error;
      toast.success("Campaign updated"); saved(); close();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Campaign could not be saved"); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">
    <h2 className="font-display text-xl font-bold sm:col-span-2">Edit campaign</h2>
    <div className="sm:col-span-2"><Label htmlFor="edit-title">Title</Label><Input id="edit-title" required minLength={3} maxLength={120} value={f.title} onChange={e => change("title",e.target.value)} /></div>
    <div className="sm:col-span-2"><Label htmlFor="edit-brief">Brief</Label><Textarea id="edit-brief" required minLength={10} maxLength={4000} rows={5} value={f.brief} onChange={e => change("brief",e.target.value)} /></div>
    <div><Label htmlFor="edit-platform">Platform</Label><select id="edit-platform" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={f.platform} onChange={e => change("platform",e.target.value)}>{PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
    <div><Label htmlFor="edit-ref">Reference URL</Label><Input id="edit-ref" type="url" maxLength={500} value={f.reference_url} onChange={e => change("reference_url",e.target.value)} /></div>
    <div><Label htmlFor="edit-rate">Proposed in-app rate</Label><Input id="edit-rate" disabled={rewardLocked} aria-describedby={rewardLocked ? "reward-lock-note" : undefined} type="number" min={0} step="0.01" value={f.reward_rate} onChange={e => change("reward_rate",e.target.value)} /></div>
    <div><Label htmlFor="edit-target">Target views</Label><Input id="edit-target" type="number" min={1} max={2147483647} step={1} value={f.target_views} onChange={e => change("target_views",e.target.value)} /></div>
    <div className="sm:col-span-2"><Label htmlFor="edit-terms">Reward terms</Label><Textarea id="edit-terms" disabled={rewardLocked} aria-describedby={rewardLocked ? "reward-lock-note" : undefined} maxLength={500} value={f.reward_description} onChange={e => change("reward_description",e.target.value)} /></div>
    {rewardLocked && <p id="reward-lock-note" className="text-sm text-muted-foreground sm:col-span-2">Reward terms are locked because a clip has been submitted to this campaign.</p>}
    <div className="flex gap-2 sm:col-span-2"><Button disabled={busy} variant="lime">{busy ? "Saving…" : "Save changes"}</Button><Button type="button" variant="outline" onClick={close}>Cancel</Button></div>
  </form>;
}
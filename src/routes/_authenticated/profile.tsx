import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Camera, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { QueryFeedback } from "@/components/QueryFeedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/lib/auth";
import { unwrap } from "@/lib/data";
import type { TablesUpdate } from "@/integrations/supabase/types";
import {
  BIO_MAX, DISPLAY_NAME_DAYS, USERNAME_DAYS, SOCIAL_FIELDS, type SocialKey,
  mediaFileError, nextChangeDate, normalizeUsername, socialUrlError, usernameError,
} from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Your profile — Clippza" }, { name: "description", content: "Edit your Clippza name, username, bio, links and images." }, { property: "og:title", content: "Your profile — Clippza" }, { property: "og:description", content: "Edit your Clippza name, username, bio, links and images." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ProfilePage,
});

const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function useSignedUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["profile-media", path],
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("profile-media").createSignedUrl(path!, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

function ProfilePage() {
  const { me } = useMe();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["profile", me?.id],
    enabled: !!me,
    queryFn: async () => unwrap(await supabase.from("profiles").select("*").eq("id", me!.id).single()),
  });
  const p = q.data;
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState<Record<SocialKey, string>>({ website_url: "", tiktok_url: "", instagram_url: "", youtube_url: "", x_url: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);
  const avatar = useSignedUrl(p?.avatar_path);
  const banner = useSignedUrl(p?.banner_path);

  useEffect(() => {
    if (!p) return;
    setName(p.display_name); setUsername(p.username ?? ""); setBio(p.bio);
    setLinks({ website_url: p.website_url ?? "", tiktok_url: p.tiktok_url ?? "", instagram_url: p.instagram_url ?? "", youtube_url: p.youtube_url ?? "", x_url: p.x_url ?? "" });
  }, [p]);

  if (q.error) return <QueryFeedback error={q.error} retry={q.refetch} />;
  if (!p || !me) return <p role="status" className="text-muted-foreground">Loading profile…</p>;

  const nameLock = nextChangeDate(p.display_name_changed_at, DISPLAY_NAME_DAYS);
  const userLock = p.username ? nextChangeDate(p.username_changed_at, USERNAME_DAYS) : null;
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ["profile", me.id] }), qc.invalidateQueries({ queryKey: ["me"] })]);

  async function save(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    const nameChanged = name.trim() !== p!.display_name;
    const u = normalizeUsername(username);
    const userChanged = u !== (p!.username ?? "");
    if (nameChanged && (name.trim().length < 2 || name.trim().length > 60)) next.name = "Use 2–60 characters.";
    if (userChanged) { const err = usernameError(username); if (err) next.username = err; }
    if (bio.length > BIO_MAX) next.bio = `Keep it under ${BIO_MAX} characters.`;
    for (const f of SOCIAL_FIELDS) { const err = socialUrlError(links[f.key]); if (err) next[f.key] = err; }
    setErrors(next);
    if (Object.keys(next).length) { document.getElementById(`f-${Object.keys(next)[0]}`)?.focus(); return; }
    setSaving(true);
    const patch: TablesUpdate<"profiles"> = { bio: bio.trim() };
    if (nameChanged) patch.display_name = name.trim();
    if (userChanged) patch.username = u;
    for (const f of SOCIAL_FIELDS) patch[f.key] = links[f.key].trim() || null;
    const { error } = await supabase.from("profiles").update(patch).eq("id", me!.id);
    setSaving(false);
    if (error) {
      const msg = error.code === "23505" ? "That username is taken." : error.message;
      if (error.code === "23505") setErrors({ username: msg });
      toast.error(msg);
      return;
    }
    toast.success("Profile saved");
    await refresh();
  }

  async function upload(kind: "avatar" | "banner", file: File | undefined) {
    if (!file) return;
    const err = mediaFileError(file);
    if (err) { toast.error(err); return; }
    setUploading(kind);
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${me!.id}/${kind}-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("profile-media").upload(path, file, { contentType: file.type });
    if (up.error) { setUploading(null); toast.error(up.error.message); return; }
    const old = kind === "avatar" ? p!.avatar_path : p!.banner_path;
    const { error } = await supabase.from("profiles").update(kind === "avatar" ? { avatar_path: path } : { banner_path: path }).eq("id", me!.id);
    if (!error && old) await supabase.storage.from("profile-media").remove([old]);
    setUploading(null);
    if (error) toast.error(error.message); else { toast.success(kind === "avatar" ? "Photo updated" : "Banner updated"); await refresh(); }
  }

  const fieldErr = (k: string) => errors[k] && <p id={`e-${k}`} className="mt-1 text-sm text-destructive">{errors[k]}</p>;

  return (
    <div>
      <PageHeader kicker={me.isClient ? "Client" : me.isClipper ? "Clipper" : "Account"} title="Your profile" />

      <section aria-label="Profile images" className="mb-8 overflow-hidden rounded-2xl border bg-card">
        <div className="relative h-32 bg-ink sm:h-44">
          {banner.data && <img src={banner.data} alt="Your banner" className="size-full object-cover" />}
          <label className="absolute right-3 top-3 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-background/90 px-3 text-sm font-medium focus-within:ring-2 focus-within:ring-lime">
            <ImagePlus className="size-4" aria-hidden /> {uploading === "banner" ? "Uploading…" : "Change banner"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={!!uploading} onChange={(e) => { upload("banner", e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
          <div className="relative -mt-10 size-20 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-ink-2 sm:size-24">
            {avatar.data ? <img src={avatar.data} alt="Your profile photo" className="size-full object-cover" /> : <span className="grid size-full place-items-center font-display text-2xl font-bold text-lime">{(p.display_name || me.email).charAt(0).toUpperCase()}</span>}
          </div>
          <div className="min-w-0 flex-1 pt-3">
            <p className="truncate font-display text-xl font-bold">{p.display_name || "Unnamed"}</p>
            <p className="text-sm text-muted-foreground">{p.username ? `@${p.username}` : "No username yet"} · Member since {fmt(new Date(p.created_at))}</p>
          </div>
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium focus-within:ring-2 focus-within:ring-lime">
            <Camera className="size-4" aria-hidden /> {uploading === "avatar" ? "Uploading…" : "Change photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={!!uploading} onChange={(e) => { upload("avatar", e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
        <p className="border-t px-5 py-2 text-xs text-muted-foreground">JPG, PNG or WebP, up to 5 MB. Images are private to your account.</p>
      </section>

      <form onSubmit={save} noValidate className="grid gap-6 rounded-2xl border bg-card p-5 md:grid-cols-2 md:p-8">
        <div>
          <Label htmlFor="f-name">Display name</Label>
          <Input id="f-name" value={name} maxLength={60} disabled={!!nameLock} aria-invalid={!!errors["name"]} aria-describedby="h-name e-name" onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          <p id="h-name" className="mt-1 text-xs text-muted-foreground">{nameLock ? `You can change this again on ${fmt(nameLock)}.` : `Can be changed once every ${DISPLAY_NAME_DAYS} days.`}</p>
          {fieldErr("name")}
        </div>
        <div>
          <Label htmlFor="f-username">Username</Label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <Input id="f-username" value={username} maxLength={21} disabled={!!userLock} autoCapitalize="none" spellCheck={false} aria-invalid={!!errors["username"]} aria-describedby="h-username e-username" onChange={(e) => setUsername(e.target.value)} className="pl-7" />
          </div>
          <p id="h-username" className="mt-1 text-xs text-muted-foreground">{userLock ? `You can change this again on ${fmt(userLock)}.` : `Lowercase letters, numbers, underscores. Once every ${USERNAME_DAYS} days.`}</p>
          {fieldErr("username")}
        </div>
        <div className="md:col-span-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="f-bio">Short bio</Label>
            <span aria-live="polite" className={`font-mono text-xs ${bio.length > BIO_MAX ? "text-destructive" : "text-muted-foreground"}`}>{bio.length}/{BIO_MAX}</span>
          </div>
          <Textarea id="f-bio" value={bio} rows={3} aria-invalid={!!errors["bio"]} aria-describedby="e-bio" onChange={(e) => setBio(e.target.value)} className="mt-1.5" placeholder="What you clip, or what your brand is about." />
          {fieldErr("bio")}
        </div>
        <fieldset className="grid gap-4 md:col-span-2 md:grid-cols-2">
          <legend className="mb-2 font-display text-lg font-bold">Social links</legend>
          {SOCIAL_FIELDS.map((f) => (
            <div key={f.key}>
              <Label htmlFor={`f-${f.key}`}>{f.label}</Label>
              <Input id={`f-${f.key}`} type="url" inputMode="url" placeholder="https://" value={links[f.key]} maxLength={300} aria-invalid={!!errors[f.key]} aria-describedby={`e-${f.key}`} onChange={(e) => setLinks({ ...links, [f.key]: e.target.value })} className="mt-1.5" />
              {fieldErr(f.key)}
            </div>
          ))}
        </fieldset>
        <div className="md:col-span-2">
          <Button type="submit" variant="lime" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
        </div>
      </form>
    </div>
  );
}

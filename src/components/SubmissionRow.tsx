import { StatusBadge } from "@/components/StatusBadge";
import { fmtDate, fmtNum } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Sub = Database["public"]["Tables"]["submissions"]["Row"];

export function SubmissionRow({ s, title, children }: { s: Sub; title?: string; children?: React.ReactNode }) {
  return (
    <div className="surface-card min-w-0 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 max-w-full flex-1">
          {title && <p className="font-display font-bold">{title}</p>}
          <a href={s.clip_url} target="_blank" rel="noopener noreferrer nofollow" className="block truncate text-sm underline">{s.clip_url}</a>
        </div>
        <StatusBadge status={s.status} />
      </div>
      {s.note && <p className="mt-2 text-sm text-muted-foreground">“{s.note}”</p>}
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        Submitted {fmtDate(s.created_at)}
        {s.status !== "submitted" && <> · Reported views {fmtNum(s.reported_views)} · Proposed in-app reward {s.proposed_reward ?? "—"}</>}
      </p>
      {s.review_note && <p className="mt-2 rounded-md bg-muted p-2 text-sm">Review note: {s.review_note}</p>}
      {children}
    </div>
  );
}

import { Button } from "@/components/ui/button";

export function QueryFeedback({ error, retry }: { error: unknown; retry: () => unknown }) {
  return <div role="alert" className="border-l-4 border-destructive bg-destructive/10 p-4">
    <p className="font-semibold">Couldn’t load this information</p>
    <p className="mt-1 text-sm text-muted-foreground">{error instanceof Error ? error.message : "Please try again."}</p>
    <Button variant="outline" size="sm" className="mt-3" onClick={() => retry()}>Try again</Button>
  </div>;
}
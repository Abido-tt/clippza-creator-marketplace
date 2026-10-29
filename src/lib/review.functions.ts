import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { reviewSchema } from "@/lib/validation";

export const reviewSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => reviewSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !admin) throw new Error("Only an authorized admin can review submissions.");
    const { id, ...review } = data;
    const { data: row, error } = await context.supabase.from("submissions").update(review).eq("id", id).eq("status", "submitted").select("id").maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("This submission has already been reviewed or is unavailable.");
    return row;
  });
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "client" | "clipper";

export function useSession() {
  const q = useQuery({ queryKey: ["session-user"], queryFn: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error && error.name !== "AuthSessionMissingError") throw error;
    return data.user;
  }, retry: false });
  return { user: q.data ?? null, loading: q.isPending, error: q.error };
}

/** Roles are read from the protected user_roles table (never from user metadata). */
export function useMe() {
  const { user, loading } = useSession();
  const q = useQuery({
    queryKey: ["me", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error("Please sign in.");
      const [{ data: roles, error: rolesError }, { data: profile, error: profileError }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      ]);
      if (rolesError || profileError) throw new Error(rolesError?.message ?? profileError?.message);
      const r = (roles ?? []).map((x) => x.role as AppRole);
      return {
        id: user.id,
        email: user.email ?? "",
        name: profile?.display_name || user.email || "",
        roles: r,
        isAdmin: r.includes("admin"),
        isClient: r.includes("client"),
        isClipper: r.includes("clipper"),
      };
    },
  });
  return { me: user ? q.data : undefined, loading: loading || (!!user && q.isPending), user, error: q.error, retry: q.refetch };
}

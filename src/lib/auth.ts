import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "client" | "clipper";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, user: session?.user ?? null, loading };
}

/** Roles are read from the protected user_roles table (never from user metadata). */
export function useMe() {
  const { user, loading } = useSession();
  const q = useQuery({
    queryKey: ["me", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user!.id),
        supabase.from("profiles").select("display_name").eq("id", user!.id).maybeSingle(),
      ]);
      const r = (roles ?? []).map((x) => x.role as AppRole);
      return {
        id: user!.id,
        email: user!.email ?? "",
        name: profile?.display_name || user!.email || "",
        roles: r,
        isAdmin: r.includes("admin"),
        isClient: r.includes("client"),
        isClipper: r.includes("clipper"),
      };
    },
  });
  return { me: q.data, loading: loading || (!!user && q.isLoading), user };
}

"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type GuardState = "checking" | "ready" | "redirecting";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<GuardState>("checking");

  useEffect(() => {
    let mounted = true;

    async function verifyToken(accessToken: string) {
      const response = await fetch("/api/admin/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (!mounted) return;

      if (response.ok) {
        setState("ready");
      } else {
        await supabase.auth.signOut();
        setState("redirecting");
        const redirect = encodeURIComponent(pathname ?? "/admin/posts");
        router.replace(`/admin/login?redirect=${redirect}`);
      }
    }

    async function verifyAdmin() {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      const session = data.session;
      if (error || !session?.access_token) {
        setState("redirecting");
        const redirect = encodeURIComponent(pathname ?? "/admin/posts");
        router.replace(`/admin/login?redirect=${redirect}`);
        return;
      }

      await verifyToken(session.access_token);
    }

    verifyAdmin();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        if (!session?.access_token) {
          setState("redirecting");
          const redirect = encodeURIComponent(pathname ?? "/admin/posts");
          router.replace(`/admin/login?redirect=${redirect}`);
          return;
        }

        void verifyToken(session.access_token);
      });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        管理画面にアクセスするにはログインしてください…
      </div>
    );
  }

  if (state === "redirecting") {
    return null;
  }

  return <>{children}</>;
}

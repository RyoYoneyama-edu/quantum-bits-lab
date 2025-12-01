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

    async function verifySession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) {
        setState("ready");
      } else {
        setState("redirecting");
        const redirect = encodeURIComponent(pathname ?? "/admin/posts");
        router.replace(`/admin/login?redirect=${redirect}`);
      }
    }

    verifySession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (session) {
          setState("ready");
        } else {
          setState("redirecting");
          const redirect = encodeURIComponent(pathname ?? "/admin/posts");
          router.replace(`/admin/login?redirect=${redirect}`);
        }
      }
    );

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

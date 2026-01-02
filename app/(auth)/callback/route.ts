import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Verifica se l'utente ha già configurato Azure DevOps
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("azure_devops_org")
          .eq("id", user.id)
          .single();

        // Se non ha azure_devops_org, redirect a /setup
        if (!profile?.azure_devops_org) {
          return NextResponse.redirect(new URL("/setup", requestUrl.origin));
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Se c'è un errore o non c'è code, redirect a login
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}


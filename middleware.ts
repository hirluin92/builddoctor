import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Debug: log tutte le variabili NEXT_PUBLIC_ disponibili
  if (process.env.NODE_ENV === "development") {
    console.log("Environment variables check:");
    console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing");
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables:");
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓" : "✗");
    // In development, allow requests to pass through to show the error page
    if (process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }
    return new NextResponse("Server configuration error", { status: 500 });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isMock = process.env.NEXT_PUBLIC_DEVOPS_MODE === "mock";

  // Proteggi /dashboard/* e /setup (salta in mock mode)
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/setup")
  ) {
    if (!isMock && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // In mock mode o se autenticato, permettere il passaggio
    return supabaseResponse;
  }

  // Proteggi /login e /callback se già autenticato (o in mock mode)
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/callback")
  ) {
    if (isMock || user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


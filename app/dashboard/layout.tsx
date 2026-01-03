import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMock = process.env.NEXT_PUBLIC_DEVOPS_MODE === "mock";

  // In mock mode, salta il controllo autenticazione
  if (!isMock) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect("/login");
      }
    } catch (error) {
      console.error("Error in dashboard layout:", error);
      // In caso di errore, permettere comunque l'accesso in development
      if (process.env.NODE_ENV === "production") {
        redirect("/login");
      }
    }
  }

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="text-xl font-bold">
            🔧 BuildDoctor
          </Link>
          {!isMock && (
            <form action={handleSignOut}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}


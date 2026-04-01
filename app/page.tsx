import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PremiumSplash } from "@/components/ui/premium-splash";

/**
 * Ru Coach | Homepage (Route: /)
 *
 * This is a server component that handles:
 * 1. Auth check (via Supabase SSR)
 * 2. Role-based redirection
 * 3. Fallback to login
 *
 * While it performs the server-side work, Next.js will show the
 * app-wide loading.tsx (which uses PremiumSplash).
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user role and redirect to appropriate dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "client";

  if (role === "admin") {
    redirect("/admin/dashboard");
  } else if (role === "receptionist") {
    redirect("/receptionist/dashboard");
  } else {
    redirect("/client/dashboard");
  }

  // In the extremely unlikely event that redirection fails
  return <PremiumSplash />;
}

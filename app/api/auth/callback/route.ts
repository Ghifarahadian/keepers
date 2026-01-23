import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  // Handle email confirmation via token_hash (new format)
  if (token_hash && type === "email") {
    // Redirect to confirmation page which will handle the verification
    return NextResponse.redirect(
      `${origin}/auth/confirm?token_hash=${token_hash}&type=${type}`
    );
  }

  // Handle OAuth callback AND email confirmation via code
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      // Check if this is an email confirmation (type=signup in query params)
      const confirmationType = searchParams.get("type");
      if (confirmationType === "signup") {
        // Redirect to success confirmation page
        return NextResponse.redirect(`${origin}/auth/confirm?verified=true`);
      }

      // Regular OAuth or login callback
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

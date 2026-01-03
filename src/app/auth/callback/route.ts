import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Auth callback handler for Supabase email confirmations and OAuth
 * This route handles the redirect after authentication
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successfully authenticated, redirect to next page
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth code exchange failed or no code provided
  // Redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

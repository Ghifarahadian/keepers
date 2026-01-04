/**
 * Unsubscribe API Endpoint
 * Handles one-click unsubscribe from waitlist emails
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyUnsubscribeToken } from "@/lib/email/crypto"

/**
 * GET /api/unsubscribe?token=xxxxx
 * Unsubscribes a user from waitlist emails
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")

  // 1. Validate token parameter
  if (!token) {
    return new NextResponse(
      renderErrorPage("Invalid unsubscribe link. Token is missing."),
      {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    )
  }

  // 2. Verify and decode token
  const waitlistId = verifyUnsubscribeToken(token)

  if (!waitlistId) {
    return new NextResponse(
      renderErrorPage(
        "Invalid or expired unsubscribe link. Please contact support if you continue to receive emails."
      ),
      {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    )
  }

  try {
    // 3. Update database - mark as unsubscribed
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase
      .from("waitlist")
      .update({
        unsubscribed: true,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", waitlistId)

    if (error) {
      console.error("Unsubscribe database error:", error)
      return new NextResponse(
        renderErrorPage(
          "Something went wrong. Please try again or contact support."
        ),
        {
          status: 500,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      )
    }

    // 4. Return success page
    return new NextResponse(renderSuccessPage(), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  } catch (error) {
    console.error("Unsubscribe error:", error)
    return new NextResponse(
      renderErrorPage(
        "Something went wrong. Please try again or contact support."
      ),
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    )
  }
}

/**
 * Render success HTML page
 */
function renderSuccessPage(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed - KEEPERS</title>
  <style>
    :root {
      --color-primary-bg: #2F6F73;
      --color-primary-text: #FDFDFD;
      --color-primary-text-muted: rgba(253, 253, 253, 0.8);
      --color-accent: #FF6F61;
      --color-accent-hover: #e65a4d;
      --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: var(--font-serif);
      background-color: var(--color-primary-bg);
      color: var(--color-primary-text);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      text-align: center;
    }
    h1 {
      font-size: 48px;
      font-weight: normal;
      margin-bottom: 8px;
      letter-spacing: 0.05em;
    }
    .tagline {
      font-size: 16px;
      font-style: italic;
      color: var(--color-primary-text-muted);
      margin-bottom: 40px;
    }
    h2 {
      font-size: 32px;
      font-weight: normal;
      margin-bottom: 16px;
    }
    p {
      font-size: 18px;
      line-height: 1.6;
      margin-bottom: 32px;
      color: rgba(253, 253, 253, 0.9);
    }
    a {
      display: inline-block;
      padding: 12px 32px;
      background-color: var(--color-accent);
      color: var(--color-primary-text);
      text-decoration: none;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 500;
      transition: background-color 0.3s ease;
    }
    a:hover {
      background-color: var(--color-accent-hover);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>KEEPERS</h1>
    <p class="tagline">Your Story, Well Kept</p>
    <h2>You've been unsubscribed</h2>
    <p>
      You won't receive any more emails from the KEEPERS waitlist.
      <br><br>
      Changed your mind? Feel free to rejoin anytime on our website.
    </p>
    <a href="/">Visit our website</a>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Render error HTML page
 */
function renderErrorPage(message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - KEEPERS</title>
  <style>
    :root {
      --color-primary-bg: #2F6F73;
      --color-primary-text: #FDFDFD;
      --color-primary-text-muted: rgba(253, 253, 253, 0.8);
      --color-accent: #FF6F61;
      --color-accent-hover: #e65a4d;
      --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: var(--font-serif);
      background-color: var(--color-primary-bg);
      color: var(--color-primary-text);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      text-align: center;
    }
    h1 {
      font-size: 48px;
      font-weight: normal;
      margin-bottom: 8px;
      letter-spacing: 0.05em;
    }
    .tagline {
      font-size: 16px;
      font-style: italic;
      color: var(--color-primary-text-muted);
      margin-bottom: 40px;
    }
    h2 {
      font-size: 32px;
      font-weight: normal;
      margin-bottom: 16px;
      color: var(--color-accent);
    }
    p {
      font-size: 18px;
      line-height: 1.6;
      margin-bottom: 32px;
      color: rgba(253, 253, 253, 0.9);
    }
    a {
      display: inline-block;
      padding: 12px 32px;
      background-color: var(--color-accent);
      color: var(--color-primary-text);
      text-decoration: none;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 500;
      transition: background-color 0.3s ease;
    }
    a:hover {
      background-color: var(--color-accent-hover);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>KEEPERS</h1>
    <p class="tagline">Your Story, Well Kept</p>
    <h2>Oops!</h2>
    <p>${message}</p>
    <a href="/">Go to homepage</a>
  </div>
</body>
</html>
  `.trim()
}

# KEEPERS Email Templates

Ready-to-use HTML email templates for Supabase authentication. Each template is beautifully designed with KEEPERS brand styling.

---

## 📁 Available Templates

### Supabase Auth Templates

| File | Supabase Template Name | Purpose |
|------|------------------------|---------|
| [confirm-signup.html](confirm-signup.html) | **Confirm signup** | Email verification after registration |
| [magic-link.html](magic-link.html) | **Magic Link** | Passwordless login link |
| [reset-password.html](reset-password.html) | **Reset Password** | Password reset request |
| [change-email.html](change-email.html) | **Change Email Address** | Confirm new email address |

### Custom Application Emails

| File | Use Case | Purpose |
|------|----------|---------|
| [waitlist-welcome.html](waitlist-welcome.html) | **Waitlist signup** | Welcome email for waitlist subscribers |

---

## 🎨 Design Features

**All templates now share a unified teal theme!**

- **Brand Colors**: Coral accent (#FF6F61), teal background (#2F6F73)
- **Typography**: Serif font (Georgia/Cambria) for elegant, timeless feel
- **Mobile Responsive**: Works perfectly on all devices
- **Clear CTAs**: Rounded coral buttons with hover states
- **Fallback Links**: Plain text URLs for accessibility
- **Consistent Layout**: Clean, centered design across all emails
- **Professional**: Full-bleed teal background, no card container
- **White Text**: High contrast for readability (#FDFDFD)

---

## 🚀 How to Use

### Step 1: Open Supabase Dashboard
Go to [Supabase Dashboard](https://app.supabase.com) → **Authentication** → **Email Templates**

### Step 2: Select Template Type
Choose the template you want to customize:
- Confirm signup
- Magic Link
- Reset Password
- Change Email Address

### Step 3: Copy & Paste
1. Open the corresponding `.html` file from this folder
2. Copy the entire HTML content
3. Paste it into the Supabase template editor
4. Click **Save**

### Step 4: Test
Send a test email to verify the template looks correct.

---

## 🔧 Customization

### Change Colors

Find and replace these values in any template:

| Element | Current Color | CSS Code |
|---------|---------------|----------|
| Button background | Coral | `#d4786c` |
| Page background | Cream | `#f5f3ef` |
| Text color | Dark gray | `#1a1a1a` |
| Secondary text | Gray | `#666666` |

### Change Text

Edit any text directly in the HTML. The `{{ .ConfirmationURL }}` placeholder must remain unchanged - Supabase will replace it with the actual confirmation link.

### Add Logo

Replace the text "KEEPERS" header with an image:

```html
<!-- Replace this: -->
<h1 style="...">KEEPERS</h1>

<!-- With this: -->
<img src="https://your-domain.com/logo.png" alt="KEEPERS" style="width: 200px; height: auto;">
```

---

## 📝 Template Variables

Supabase automatically replaces these variables:

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | The confirmation/action link |
| `{{ .Token }}` | The verification token |
| `{{ .TokenHash }}` | Hashed version of token |
| `{{ .SiteURL }}` | Your site URL from settings |

**Important:** Always keep `{{ .ConfirmationURL }}` in your templates!

---

## ✅ Testing Checklist

After applying a template:

- [ ] Send test email to yourself
- [ ] Check appearance on desktop email client
- [ ] Check appearance on mobile device
- [ ] Verify button link works correctly
- [ ] Verify fallback text link works
- [ ] Test in different email providers (Gmail, Outlook, Apple Mail)

---

## 🐛 Troubleshooting

### Email looks broken in Gmail
- Gmail strips some CSS styles
- Use inline styles (already done in these templates)
- Avoid CSS classes and external stylesheets

### Button doesn't work
- Verify `{{ .ConfirmationURL }}` is in the href attribute
- Check that Supabase site URL is configured correctly
- Ensure no extra spaces around the variable

### Images not showing
- Use absolute URLs (https://...)
- Host images on a CDN or your domain
- Some email clients block images by default

---

## 📚 Resources

- **Full Documentation**: [../docs/email-templates.md](../docs/email-templates.md)
- **Supabase Email Docs**: https://supabase.com/docs/guides/auth/auth-email-templates
- **Email Testing Tool**: https://www.caniemail.com/

---

## 🎯 Quick Copy Commands

### Confirm Signup
```bash
cat email_templates/confirm-signup.html | clip
# Then paste into Supabase: Authentication → Email Templates → Confirm signup
```

### Magic Link
```bash
cat email_templates/magic-link.html | clip
# Then paste into Supabase: Authentication → Email Templates → Magic Link
```

### Reset Password
```bash
cat email_templates/reset-password.html | clip
# Then paste into Supabase: Authentication → Email Templates → Reset Password
```

### Change Email
```bash
cat email_templates/change-email.html | clip
# Then paste into Supabase: Authentication → Email Templates → Change Email Address
```

---

## 📧 Waitlist Email Usage

The **waitlist-welcome.html** template is used for waitlist signups and is **already integrated** into your codebase.

### How It Works

1. **User signs up on waitlist** via `/coming-soon` page
2. **Email is automatically sent** using Resend API
3. **Template is in:** [lib/email/send-waitlist-welcome.ts](../lib/email/send-waitlist-welcome.ts)
4. **No Supabase configuration needed** - this uses Resend directly

### Customizing Waitlist Email

The waitlist email now reads from the HTML template file, making it easy to customize!

**To Modify the Email:**
1. Edit [waitlist-welcome.html](waitlist-welcome.html) directly
2. Save your changes
3. Restart your dev server (or redeploy)
4. Changes apply automatically!

**Template Variables:**
- `{{EMAIL}}` - Replaced with subscriber's email address
- `{{UNSUBSCRIBE_URL}}` - Replaced with unsubscribe link

**Note:** The template is loaded at server startup and cached for performance.

### Testing Waitlist Email

To test the waitlist welcome email:
1. Go to `/coming-soon` page
2. Enter your email in the waitlist form
3. Submit the form
4. Check your inbox for the welcome email

**Note:** Make sure these environment variables are set:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

---

**Last Updated:** January 2026
**Project:** KEEPERS - Custom Photobook Platform

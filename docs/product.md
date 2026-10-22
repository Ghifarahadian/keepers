# Keepers: Product and Business Doc

Last updated 22 Oct 2026 · Owner: Ghif · Live version: https://claude.ai/artifact/HmQmnnv5gfrAmxjfzFG9rE

## Summary

Keepers is a mobile-first online photo album maker that turns phone photos into a 20-page album, sold as a PDF or a printed book. Tagline: **"Keepers: For Moments Worth More than A Scroll"**. Domain: keepers.id.

A visitor taps "Create your memory" and lands straight in the editor with a ready-made album, no sign-up. They fill photo slots, crop, pick a cover, and only sign in at checkout. The first market is Indonesia; the founder (Ghif) runs it from Singapore.

- **Two products:** a PDF album, downloadable right after payment, and a printed album made by a local printer.
- **MVP stance:** one book size, one template set, one price per product, manual payment and fulfilment until volume justifies automation.

## Target customer and market

The first customer is an Indonesian smartphone user who wants a moment off their camera roll and into something they can hold or gift. Indonesia comes first; other markets wait until the order flow is proven there.

| Segment | Moment | What they need from Keepers |
| --- | --- | --- |
| Young couples | Anniversary, wedding, honeymoon | A gift-worthy printed album, made fast on a phone |
| Parents | Baby's first year, birthdays, family trips | An easy way to fill 20 pages without design skills |
| Friend groups and students | Graduation, farewells, trips | A cheap PDF they can share, or one printed copy as a keepsake |
| Gift buyers | Birthdays, Mother's Day, Lebaran | A finished album delivered to someone else's address |

Why mobile-first: the photos already live on the phone, and most buyers will start from a link shared on Instagram, TikTok or WhatsApp. PC is supported for people who prefer a larger screen to arrange pages.

The main alternatives are doing nothing (photos stay on the phone), printing loose photos at a local shop, and existing photobook services. Keepers competes on speed: no account, no blank canvas, a finished album in one sitting.

## Product

Every album is 20 pages in one fixed book size, built from one template set, so the user arranges photos instead of designing pages.

- **Cover:** a fixed template holding a title and one picture. The picture comes from Keepers' own collection or from the user's upload.
- **Pages:** each page starts on a default layout. The user can switch any page to one of a set of predetermined layouts (for example one full-bleed photo, two side by side, a grid of four).
- **Photos:** the user uploads photos into slots and crops each to fit its slot.
- **Saving:** the album is saved as the user works, first against the anonymous session, then against their account once they sign in.

| Product | What the customer gets | When | Price |
| --- | --- | --- | --- |
| PDF album | A print-ready PDF of the 20-page album | Download right after payment | [PDF PRICE] |
| Printed album | The printed and bound book, shipped to an address in Indonesia (the PDF is included) | After printing and shipping, about [PRINT + SHIPPING DAYS] days | [PRINT PRICE] + [SHIPPING FEE] |

Whether the printed album includes the PDF at no extra charge is an open question; it costs nothing to deliver and makes the higher price easier to accept.

## Pricing and unit economics

One price per product for the MVP, in IDR. No numbers are set yet; the placeholders below get filled once a printer quotes.

| Line | PDF album | Printed album |
| --- | --- | --- |
| Price to customer | [PDF PRICE] | [PRINT PRICE] |
| Shipping charged to customer | none | [SHIPPING FEE] |
| Print cost | none | [PRINT COST] |
| Shipping cost | none | [SHIPPING COST] |
| Payment fee (manual transfer now, Xendit later) | [PAYMENT FEE] | [PAYMENT FEE] |
| Hosting and storage per album | [STORAGE COST] | [STORAGE COST] |
| Tax on the sale (depends on entity) | [TAX] | [TAX] |
| **Margin per order** | **[PDF MARGIN]** | **[PRINT MARGIN]** |

- The PDF is close to pure margin, so it can be priced low to win first orders and reviews.
- The printed price has to cover [PRINT COST], packaging and [SHIPPING COST] with room left for a misprint reprint now and then.
- Shipping can be a flat fee for the MVP; per-region rates come later.
- Fixed monthly costs to track: domain, hosting, storage, email sending, and later Xendit and company admin ([MONTHLY FIXED COST]).

## User flow

The user reaches a filled-in editor in one tap and signs in only when they are ready to pay.

1. **Landing page** on keepers.id with the tagline, sample albums and one button: "Create your memory".
2. **Editor opens straight away** with an anonymous 20-page album on the preset template. No sign-up.
3. **Fill the album:** upload photos into slots and crop them; set the cover title and pick a cover picture (Keepers collection or own upload); switch page layouts where wanted.
4. **Preview** the whole album page by page.
5. **Choose a product:** PDF album or printed album (printed asks for the shipping address).
6. **Sign in** with Google or an email link. The anonymous album is attached to the account.
7. **Checkout:** order summary and payment instructions (bank transfer or QRIS for the MVP).
8. **Order status page:** Awaiting payment, then Paid. PDF orders show the download here and by email. Printed orders move through Printing and Shipped, with the tracking number once it is entered.

**Returning users:** a visitor with an album in progress sees "Continue your album" on the landing page. Signed-in users get "My albums", listing drafts and past orders with their status.

**Order statuses:** Awaiting payment, Paid, Printing (printed only), Shipped (printed only), Delivered, Cancelled.

## Per-order operations

Every MVP order needs one manual action (confirm payment), and printed orders need two more (send to printer, enter tracking). All three happen on one admin page.

| Step | Who | PDF album | Printed album |
| --- | --- | --- | --- |
| 1. Order placed | Customer | Status: Awaiting payment; payment instructions emailed | Same |
| 2. Payment checked | Ghif, on the bank or QRIS app | Match amount and order code | Same |
| 3. Mark paid | Ghif, admin page | PDF generated and download link emailed; order done | Status: Paid; print-ready PDF generated |
| 4. Send to printer | Ghif | none | PDF and shipping address sent to the printer; status: Printing |
| 5. Shipped | Printer, then Ghif | none | Printer ships; Ghif enters courier and tracking number; status: Shipped; customer emailed |
| 6. Delivered or issue | Ghif | none | Mark delivered; handle reprints or refunds case by case |

- **Order code:** each order gets a short unique code and, ideally, a unique transfer amount so payments are easy to match.
- **Time cost:** about [MINUTES PER ORDER] minutes per printed order. Track it; when it hurts, automate payments (Xendit) first, then printer hand-off.
- **Unpaid orders:** auto-cancel after [PAYMENT WINDOW] hours.
- **Customer support:** one WhatsApp number and one email address, listed on the order page.

## Business and legal setup

The biggest open item is which entity takes the money: Keepers sells in Indonesia while Ghif lives in Singapore, and Xendit needs a registered business. Until that is settled, payments stay manual.

| Option | How it works | Trade-off |
| --- | --- | --- |
| Personal account, no entity (pre-launch and soft launch) | Customers pay by bank transfer or QRIS to an account Ghif controls | Fastest to start; not scalable, and personal tax treatment needs checking |
| Indonesian entity (for example a PT PMA, or a local partner's company) | Local company takes IDR payments and contracts the printer | Fits the market and Xendit Indonesia; heavier setup and minimum capital rules for foreign owners |
| Singapore entity (Pte. Ltd.) | Ghif's own company sells to Indonesian customers | Easy for Ghif to run; Indonesian tax on digital sales and Xendit's country coverage need checking |

To do whichever option is chosen:

- Register keepers.id (a .id domain requires Indonesian identity or business documents; confirm eligibility).
- Privacy policy and terms of service covering photo storage, how long albums are kept, and refunds for misprints.
- Photo rights: users confirm they own or may use what they upload; Keepers' cover collection must be licensed for print.
- Data protection: Indonesia's Personal Data Protection Law (UU PDP) applies to customer data and photos.
- Tax: confirm VAT or income tax on sales under the chosen entity ([TAX]).
- Xendit: apply once the entity exists; online payment is designed to slot in later without changing the order flow.

None of this is legal advice; check the entity and tax choice with an accountant who knows both Indonesia and Singapore.

## MVP scope

The MVP sells one album format two ways, with every back-office step done by hand on an admin page.

| In the MVP | Later |
| --- | --- |
| One book size, 20 pages | More sizes, page counts, paper and binding options |
| One template set: fixed cover, default page layout plus predetermined layouts | More template sets, themes, free-form editing, text on pages |
| Anonymous start, sign-in at order (Google or email link) | Social sharing, collaborative albums |
| Photo upload into slots and crop | Auto-fill, photo import from Google Photos or Instagram |
| Two products: PDF album, printed album | Gift wrap, multiple copies, discount codes |
| Manual bank transfer and QRIS, marked paid on admin page | Xendit online payment |
| Manual print hand-off, tracking entered on admin page | Printer integration, automatic tracking updates |
| Order status page and order emails | WhatsApp notifications |
| Indonesia only, IDR only | Other markets and currencies |
| Mobile-first web, works on PC | Native apps |

## Launch checklist

Launch can happen with PDF orders alone; printed orders switch on once a printer has passed a test print.

**Product**

- [ ] Landing page with tagline, sample albums and "Create your memory"
- [ ] Editor: 20-page preset album, photo upload, crop, layout switch, cover title and picture
- [ ] Cover picture collection uploaded and licensed
- [ ] Autosave for anonymous albums and "Continue your album"
- [ ] Sign-in with Google and email link; anonymous album attached on sign-in
- [ ] Checkout with payment instructions and order code
- [ ] Order status page, "My albums", order emails
- [ ] Print-ready PDF export checked against the printer's spec
- [ ] Admin page: mark paid, send to printer, enter tracking, cancel

**Operations**

- [ ] Printer chosen, price quoted, test print approved
- [ ] Courier and shipping fee decided
- [ ] Bank account and QRIS ready to receive payments
- [ ] Support WhatsApp number and email set up

**Business and legal**

- [ ] keepers.id registered and pointing to the site
- [ ] Entity decision made for the soft launch
- [ ] Terms of service and privacy policy published
- [ ] Prices set for both products

**Go to market**

- [ ] Instagram and TikTok accounts with sample albums
- [ ] First 10 orders from friends and family to test the full flow

## Open questions

- [ ] Which business entity takes payments: personal account, Indonesian entity, or Singapore entity?
- [ ] Which printer, and what are [PRINT COST], turnaround and quality?
- [ ] What book size and paper for the single MVP format?
- [ ] What are [PDF PRICE] and [PRINT PRICE]?
- [ ] Does the printed album include the PDF for free?
- [ ] Flat shipping fee or per-region rates, and which courier?
- [ ] How long are albums and photos kept after an order, or when a draft is abandoned?
- [ ] Can the PDF be printed by customers elsewhere, or is it watermarked or low-resolution?
- [ ] Refund and reprint policy for damaged or misprinted books
- [ ] Is the keepers.id domain already registered, and under whose name?

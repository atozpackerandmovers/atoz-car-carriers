# A TO Z Car Carriers Website Enhancement Report

Date: 24 July 2026

## Tracking configuration verified from the previous live website

- Google Tag Manager: `GTM-52Z7X39B`
- Google Ads destination: `AW-972292918`
- Google Ads Conversion ID: `972292918`
- Google Ads Conversion Label: `LQkbCKbti6cCELaG0M8D`
- Google Analytics 4: `G-B4KR2RETYR`
- Existing lead event: `lead_submitted`

The ID and label were read from the compiled public container for
`GTM-52Z7X39B`; no new Google property, tag, or conversion action was created.
The previous website's form handler fired `lead_submitted` even when Formspree
failed. The new implementation does not copy this defect.

## Files modified

- All 56 HTML pages: existing GTM container installed once per page; canonical URLs added to indexable pages; cache versions updated.
- `app.js`: conversion safety, duplicate prevention, GA4 click events, campaign attribution preservation, correct mobile quote targets, and removal of browser storage for customer enquiry details.
- `config.js`: verified Google identifiers and existing Ads conversion destination recorded; placeholder conversion destination removed.
- `index.html`: genuine loading-video gallery and independent Google/Justdial review links added; public placeholder instructions removed.
- `styles.css`: responsive video and verified-review layouts.
- `tracking.html`: misleading local tracking response replaced with a privacy-conscious verified status contact flow.
- `assets/car-loading-operation.mp4`
- `assets/vehicle-delivery-operation.mp4`
- `assets/car-loading-video-poster.webp`
- `assets/vehicle-delivery-video-poster.webp`

## Events configured

| Event | Trigger | Personal customer data sent |
| --- | --- | --- |
| `lead_submitted` | GA4 event only after Formspree returns a successful HTTP response | No |
| `phone_click` | Click on a `tel:` link | No |
| `whatsapp_click` | Click on an official WhatsApp link | No |
| `get_quote_click` | Click on a quote CTA | No |
| `contact_click` | Click on a contact CTA | No |

Tracking properties are limited to page path, form name, and CTA placement. Customer name, customer phone, email, pickup address, delivery address, and vehicle number are not pushed to Google.
The existing Google Ads conversion remains in GTM and is allowed to load on the
thank-you page only when a recent one-time Formspree success token is present.

## Conversion safeguards

- No lead conversion on page load.
- No lead conversion when a form is opened.
- No lead conversion when validation fails.
- No lead conversion when Formspree returns an error.
- Submit button is locked while a request is in progress.
- A submission lock and enquiry-specific guard prevent duplicate lead events.
- The success redirect waits briefly for the GA4 event callback.
- The thank-you page consumes a recent success token before loading GTM; direct
  visits, refreshes, failed submissions, and stale tokens do not load the Ads
  conversion tag.
- Full customer enquiry records are no longer retained in browser `localStorage`.

## Customer trust and performance work

- Added two genuine vehicle-loading videos.
- Videos use `preload="none"` and do not autoplay.
- Added responsive poster images in WebP.
- Video 1 reduced from about 2.0 MB to 1.5 MB.
- Video 2 reduced from about 14.3 MB to 4.5 MB.
- Added direct Google Reviews and Justdial profile links.
- Added the supplied Justdial rating statement with a notice that ratings and counts may change.
- Removed visible developer placeholder instructions.
- Fixed mobile sticky quote targets for homepage, district, and route pages.

## Verification completed

- 56 HTML pages checked.
- 718 internal links, fragments, scripts, styles, media and asset references checked.
- Missing internal targets: 0.
- Missing referenced assets: 0.
- Duplicate HTML IDs: 0.
- Public enquiry forms checked: 46.
- `target="_blank"` links missing `noopener`: 0.
- JavaScript syntax errors: 0.
- GTM installed once on 55 normal pages; the thank-you page has one conditional,
  success-token-gated loader and no unconditional or noscript conversion load.
- Placeholder Google Ads conversion destination removed.
- Automated event tests:
  - successful form response: one lead event;
  - duplicate submission: prevented;
  - failed form response: zero lead events;
  - invalid form: zero lead events;
  - phone, WhatsApp, quote, and contact click events: passed.

## Live verification required after deployment

After deployment, complete these account-level checks:

1. Open Tag Assistant and confirm one `GTM-52Z7X39B` container per page.
2. Confirm the existing Ads conversion fires once after a verified Formspree
   success and not on a direct or refreshed thank-you page.
3. Confirm `lead_submitted`, `phone_click`, `whatsapp_click`,
   `get_quote_click`, and `contact_click` in GA4 DebugView.
4. Send one clearly labelled live test enquiry and confirm receipt at the Formspree destination mailbox.
5. Review Google Ads Conversion Diagnostics after traffic is received.

No new Google Tag, Google Ads conversion action, Analytics property, or GTM container was created.

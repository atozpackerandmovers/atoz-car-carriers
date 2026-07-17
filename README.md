# A TO Z Car Carriers Website

Open `index.html` to preview the site.

## Formspree setup

All public enquiry forms read Formspree from one central file:

```js
// config.js
window.AZC_CONFIG = {
  formspreeEndpoint: "https://formspree.io/f/mnnzokyb"
};
```

Connected forms:

- Homepage Quick Quote / Get Free Quote
- Contact Us
- Callback Request
- Route Enquiry
- Google Ads Landing Page Form

The current static preview:

- Generates and displays a unique enquiry ID.
- Captures vehicle category and exact vehicle name/model selected or entered by the customer.
- Captures UTM source, medium, campaign, term, content, GCLID, referrer, device, and submission time.
- Includes 30 Odisha district-specific Google Ads landing pages under `odisha/`.
- Includes 11 Bhubaneswar interstate route pages under `routes/`.
- Includes dedicated `interstate.html`, `pricing.html`, `tracking.html`, and `insurance.html` trust pages.
- Includes a homepage indicative estimate calculator for distance band, vehicle size, carrier type, and pickup option.
- Includes right-side floating WhatsApp and call buttons across the site.
- Saves preview enquiries in browser local storage if no production endpoint is configured.
- Includes Google Analytics 4 and Google Ads conversion hooks that fire only after confirmed Formspree delivery.
- Includes Firebase Firestore integration in `app.js`; add your Firebase project values in `config.js` and set `firebase.enabled` to `true`.

For production Google Ads conversion tracking, replace `AW-CONVERSION_ID/CONVERSION_LABEL` in `config.js`.

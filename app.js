const config = window.AZC_CONFIG || {};
const endpoint = config.formspreeEndpoint || "";

function installFloatingActions() {
  if (document.querySelector(".floating-actions")) return;

  const whatsappNumber = config.whatsappNumber || "919338888550";
  const phoneNumber = (config.phoneNumber || "+91 9338888550").replace(/\s/g, "");
  const phoneHref = `tel:${phoneNumber}`;
  const message = encodeURIComponent(
    "Hello A TO Z Car Carriers, I need a car transport quotation."
  );

  const actions = document.createElement("div");
  actions.className = "floating-actions";
  actions.setAttribute("aria-label", "Quick contact actions");
  actions.innerHTML = `
    <a class="floating-action whatsapp" href="https://wa.me/${whatsappNumber}?text=${message}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      <span aria-hidden="true">WA</span>
    </a>
    <a class="floating-action call" href="${phoneHref}" aria-label="Call A TO Z Car Carriers">
      <span aria-hidden="true">Call</span>
    </a>
  `;
  document.body.appendChild(actions);
}

installFloatingActions();

function installMobileStickyBar() {
  if (document.querySelector(".mobile-sticky-bar")) return;

  const whatsappNumber = config.whatsappNumber || "919338888550";
  const phoneNumber = (config.phoneNumber || "+91 9338888550").replace(/\s/g, "");
  const message = encodeURIComponent(
    "Hello A TO Z Car Carriers, I need a car transport quotation."
  );
  const bar = document.createElement("nav");
  const localQuoteTarget = document.querySelector("#district-quote")
    ? "#district-quote"
    : document.querySelector("#route-quote")
      ? "#route-quote"
      : document.querySelector("#quote")
        ? "#quote"
        : "index.html#quote";
  bar.className = "mobile-sticky-bar";
  bar.setAttribute("aria-label", "Mobile quick actions");
  bar.innerHTML = `
    <a href="tel:${phoneNumber}">Call Now</a>
    <a href="https://wa.me/${whatsappNumber}?text=${message}" target="_blank" rel="noopener">WhatsApp</a>
    <a href="${localQuoteTarget}" data-track-action="get_quote">Get Quote</a>
  `;
  document.body.appendChild(bar);
}

installMobileStickyBar();

function animateHeaderPhone() {
  document.querySelectorAll(".header-cta").forEach((link) => {
    if (link.dataset.phoneAnimated === "true") return;

    const text = link.textContent.trim();
    link.dataset.phoneAnimated = "true";
    link.setAttribute("aria-label", text);
    link.textContent = "";

    Array.from(text).forEach((char, index) => {
      const span = document.createElement("span");
      const classes = ["phone-letter"];
      if (char === " ") classes.push("phone-space");
      if (/\d/.test(char)) classes.push("phone-digit");
      if (char === "+") classes.push("phone-plus");
      span.className = classes.join(" ");
      span.style.setProperty("--i", index);
      span.textContent = char === " " ? "\u00a0" : char;
      span.setAttribute("aria-hidden", "true");
      link.appendChild(span);
    });
  });
}

animateHeaderPhone();

function sendAnalyticsEvent(eventName, details = {}) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("event", eventName, {
    send_to: config.googleAnalyticsId,
    page_path: window.location.pathname,
    ...details
  });
}

function trackContactClicks() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    if (href.startsWith("tel:")) {
      sendAnalyticsEvent("phone_click", {
        link_location: link.closest("header")
          ? "header"
          : link.closest(".mobile-sticky-bar")
            ? "mobile_sticky_bar"
            : "page_content"
      });
    }

    if (href.includes("wa.me/") || href.includes("api.whatsapp.com")) {
      sendAnalyticsEvent("whatsapp_click", {
        link_location: link.closest(".mobile-sticky-bar")
          ? "mobile_sticky_bar"
          : link.closest(".floating-actions")
            ? "floating_button"
            : "page_content"
      });
    }

    if (
      link.dataset.trackAction === "get_quote" ||
      /#(?:quote|district-quote|route-quote)$/.test(href)
    ) {
      sendAnalyticsEvent("get_quote_click", {
        link_location: link.closest(".mobile-sticky-bar")
          ? "mobile_sticky_bar"
          : "page_content"
      });
    }

    if (
      href === "#contact" ||
      href.endsWith("index.html#contact") ||
      /(?:^|\/)contact-us\.html(?:[?#].*)?$/.test(href)
    ) {
      sendAnalyticsEvent("contact_click", {
        link_location: link.closest("header") ? "header" : "page_content"
      });
    }
  });
}

trackContactClicks();

function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}

function makeEnquiryId() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AZC-${stamp}-${random}`;
}

function getCampaignFields() {
  const params = new URLSearchParams(window.location.search);
  const storageKey = "azc_campaign_attribution";
  let saved = {};
  try {
    saved = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
  } catch {
    saved = {};
  }

  const current = {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    utmTerm: params.get("utm_term") || "",
    utmContent: params.get("utm_content") || "",
    gclid: params.get("gclid") || "",
    referrer: document.referrer || "",
    device: getDeviceType(),
    submissionTime: new Date().toISOString()
  };

  const attribution = {
    utmSource: current.utmSource || saved.utmSource || "",
    utmMedium: current.utmMedium || saved.utmMedium || "",
    utmCampaign: current.utmCampaign || saved.utmCampaign || "",
    utmTerm: current.utmTerm || saved.utmTerm || "",
    utmContent: current.utmContent || saved.utmContent || "",
    gclid: current.gclid || saved.gclid || ""
  };

  if (Object.values(attribution).some(Boolean)) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(attribution));
    } catch {
      // Attribution persistence is optional; form submission must still work.
    }
  }

  return { ...current, ...attribution };
}

function setFormFields(form, values) {
  Object.entries(values).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (field) field.value = value;
  });
}

function addOrUpdateHiddenField(form, name, value) {
  let field = form.elements.namedItem(name);
  if (!field) {
    field = document.createElement("input");
    field.type = "hidden";
    field.name = name;
    form.appendChild(field);
  }
  field.value = value;
}

async function saveToFirestore(record) {
  const firebase = config.firebase || {};
  if (!firebase.enabled || !firebase.config?.projectId) {
    return { saved: false, reason: "firebase_not_configured" };
  }

  const [{ initializeApp }, { getFirestore, collection, addDoc }] =
    await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
    ]);

  const app = initializeApp(firebase.config);
  const db = getFirestore(app);
  const collectionName = firebase.collectionName || "enquiries";
  await addDoc(collection(db, collectionName), record);
  return { saved: true };
}

function fireLeadAnalyticsOnce(form, enquiryId, onComplete) {
  const formName = form.id || form.elements.namedItem("formType")?.value || "lead_form";
  const dedupeKey = `azc_lead_fired:${enquiryId}`;

  if (sessionStorage.getItem(dedupeKey) === "true") {
    onComplete();
    return;
  }

  sessionStorage.setItem(dedupeKey, "true");
  let completed = false;
  const finish = () => {
    if (completed) return;
    completed = true;
    onComplete();
  };

  sendAnalyticsEvent("lead_submitted", {
    form_name: formName,
    event_callback: finish,
    event_timeout: 2000,
    transport_type: "beacon"
  });

  window.setTimeout(finish, 2200);
}

function showThankYou(enquiryId, deliveryStatus) {
  const successRecord = {
    enquiryId,
    deliveryStatus,
    time: new Date().toISOString()
  };

  sessionStorage.setItem(
    "azc_last_enquiry",
    JSON.stringify(successRecord)
  );
  sessionStorage.setItem("azc_conversion_token", JSON.stringify(successRecord));

  const thankYouPath = window.location.pathname.includes("/odisha/") || window.location.pathname.includes("/routes/")
    ? "../thank-you.html"
    : "thank-you.html";
  window.location.href = `${thankYouPath}?id=${encodeURIComponent(enquiryId)}`;
}

function prepareNativeFormFallback(form, enquiryId) {
  form.action = endpoint;
  form.method = "POST";
  form.acceptCharset = "UTF-8";
  addOrUpdateHiddenField(
    form,
    "_subject",
    `A TO Z Car Carriers enquiry ${enquiryId}`
  );

  const email = form.elements.namedItem("email")?.value;
  if (email) {
    addOrUpdateHiddenField(form, "_replyto", email);
  }

  const basePath = window.location.pathname.includes("/odisha/") || window.location.pathname.includes("/routes/")
    ? "../thank-you.html"
    : "thank-you.html";
  addOrUpdateHiddenField(form, "_next", `${basePath}?id=${encodeURIComponent(enquiryId)}`);
}

async function sendToFormspree(formData) {
  if (!endpoint) {
    throw new Error("Formspree endpoint missing in config.js");
  }

  const customerEmail = formData.get("email");
  if (customerEmail) {
    formData.set("_replyto", customerEmail);
  }

  formData.set(
    "_subject",
    `A TO Z Car Carriers enquiry ${formData.get("enquiryId") || ""}`.trim()
  );

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData
  });

  if (!response.ok) {
    let detail = "";
    try {
      const data = await response.json();
      detail = data?.errors?.map((error) => error.message).join(", ") || "";
    } catch {
      detail = response.statusText;
    }
    throw new Error(detail || "Formspree delivery failed");
  }

  return { delivered: true };
}

function normalizeRecord(enquiryId, formData, deliveryStatus) {
  const fields = Object.fromEntries(formData.entries());
  return {
    enquiryId,
    destinationEmail: config.destinationEmail || "",
    deliveryStatus,
    createdAt: fields.submissionTime || new Date().toISOString(),
    customerName: fields.name || "",
    mobileNumber: fields.phone || "",
    whatsappNumber: fields.whatsappNumber || "",
    email: fields.email || "",
    pickupCity: fields.pickupCity || "",
    deliveryCity: fields.deliveryCity || "",
    vehicleDetails: [fields.vehicleCategory, fields.vehicleName]
      .filter(Boolean)
      .join(" - "),
    pickupDate: fields.pickupDate || "",
    message: fields.message || "",
    utmSource: fields.utmSource || "",
    utmMedium: fields.utmMedium || "",
    utmCampaign: fields.utmCampaign || "",
    gclid: fields.gclid || "",
    fields
  };
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const statusEl = form.querySelector(".form-note");
  const phoneField = form.elements.namedItem("phone");
  const pickupField = form.elements.namedItem("pickupCity");
  const deliveryField = form.elements.namedItem("deliveryCity");

  if (form.dataset.submitting === "true") return;

  if (phoneField) {
    const digits = phoneField.value.replace(/\D/g, "");
    if (digits.length !== 10) {
      if (statusEl) {
        statusEl.textContent = "Please enter a valid 10-digit mobile number.";
        statusEl.classList.add("form-error");
      }
      phoneField.focus();
      return;
    }
  }

  if (pickupField?.hasAttribute("required") && !pickupField.value.trim()) {
    if (statusEl) {
      statusEl.textContent = "Please enter pickup city.";
      statusEl.classList.add("form-error");
    }
    pickupField.focus();
    return;
  }

  if (deliveryField?.hasAttribute("required") && !deliveryField.value.trim()) {
    if (statusEl) {
      statusEl.textContent = "Please enter delivery city.";
      statusEl.classList.add("form-error");
    }
    deliveryField.focus();
    return;
  }

  const enquiryId = makeEnquiryId();
  const campaignFields = getCampaignFields();

  setFormFields(form, { enquiryId, ...campaignFields });
  prepareNativeFormFallback(form, enquiryId);

  if (submitButton) {
    submitButton.dataset.defaultText ||= submitButton.textContent.trim();
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
  }
  form.dataset.submitting = "true";
  if (statusEl) {
    statusEl.classList.remove("form-error");
    statusEl.textContent = "Submitting your enquiry...";
  }

  const formData = new FormData(form);
  let formspreeResult = { delivered: false };
  let firestoreResult = { saved: false };
  let deliveryStatus = "pending";
  let formspreeError = "";

  try {
    formspreeResult = await sendToFormspree(formData);
    deliveryStatus = formspreeResult.delivered ? "formspree_delivered" : "local_preview";
  } catch (error) {
    deliveryStatus = "formspree_retry_needed";
    formspreeError = error.message;
  }

  const record = normalizeRecord(enquiryId, formData, deliveryStatus);
  if (formspreeError) {
    record.formspreeError = formspreeError;
  }

  try {
    firestoreResult = await saveToFirestore(record);
    record.firestoreStatus = firestoreResult.saved ? "saved" : firestoreResult.reason;
  } catch (error) {
    record.firestoreStatus = "retry_needed";
    record.firestoreError = error.message;
  }

  if (formspreeResult.delivered) {
    fireLeadAnalyticsOnce(form, enquiryId, () => {
      showThankYou(enquiryId, deliveryStatus);
    });
    return;
  }

  form.dataset.submitting = "false";
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = submitButton.dataset.defaultText || "Submit Enquiry";
  }
  if (statusEl) {
    statusEl.textContent =
      `Your enquiry could not be sent. Please check your connection and try again, or call +91 9338888550. Enquiry ID: ${enquiryId}`;
    statusEl.classList.add("form-error");
  }
}

document
  .querySelectorAll("form.public-enquiry-form, form#quoteForm")
  .forEach((form) => {
    form.classList.add("public-enquiry-form");
    if (endpoint) {
      form.action = endpoint;
      form.method = "POST";
    }
    form.addEventListener("submit", handleFormSubmit);
  });

const estimateButton = document.querySelector("#estimateButton");
estimateButton?.addEventListener("click", () => {
  const distance = document.querySelector("#estimateDistance")?.value || "local";
  const vehicle = document.querySelector("#estimateVehicle")?.value || "small";
  const carrier = document.querySelector("#estimateCarrier")?.value || "open";
  const pickup = document.querySelector("#estimatePickup")?.value || "standard";
  const result = document.querySelector("#estimateResult");

  const base = {
    local: [3500, 7000],
    district: [6500, 14000],
    nearstate: [11000, 24000],
    metro: [18000, 42000]
  }[distance];

  const vehicleFactor = {
    small: 0.9,
    sedan: 1,
    suv: 1.18,
    premium: 1.38
  }[vehicle];

  const carrierFactor = carrier === "enclosed" ? 1.45 : 1;
  const pickupFactor = {
    standard: 1,
    door: 1.12,
    urgent: 1.22
  }[pickup];

  const low = Math.round((base[0] * vehicleFactor * carrierFactor * pickupFactor) / 500) * 500;
  const high = Math.round((base[1] * vehicleFactor * carrierFactor * pickupFactor) / 500) * 500;

  if (result) {
    result.innerHTML = `Rs ${low.toLocaleString("en-IN")} - Rs ${high.toLocaleString("en-IN")}<small>The displayed estimate is indicative only. Final quotation depends on exact pickup and delivery locations, vehicle model, vehicle condition, route availability, carrier type, seasonal demand, insurance requirement and additional service requirements.</small>`;
  }
});

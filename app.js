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
  bar.className = "mobile-sticky-bar";
  bar.setAttribute("aria-label", "Mobile quick actions");
  bar.innerHTML = `
    <a href="tel:${phoneNumber}">Call Now</a>
    <a href="https://wa.me/${whatsappNumber}?text=${message}" target="_blank" rel="noopener">WhatsApp</a>
    <a href="#quote">Get Quote</a>
  `;
  document.body.appendChild(bar);
}

installMobileStickyBar();

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
  return {
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

function saveLocalRecord(record) {
  const key = "azc_enquiries";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push(record);
  localStorage.setItem(key, JSON.stringify(existing.slice(-100)));
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

function fireConversionEvents(enquiryId) {
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "generate_lead", {
    event_category: "Lead",
    event_label: "A TO Z Car Carriers",
    enquiry_id: enquiryId
  });

  if (config.googleAdsConversionSendTo) {
    window.gtag("event", "conversion", {
      send_to: config.googleAdsConversionSendTo,
      enquiry_id: enquiryId
    });
  }
}

function showThankYou(enquiryId, deliveryStatus) {
  sessionStorage.setItem(
    "azc_last_enquiry",
    JSON.stringify({ enquiryId, deliveryStatus, time: new Date().toISOString() })
  );

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
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
  }
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

  saveLocalRecord(record);

  if (formspreeResult.delivered) {
    fireConversionEvents(enquiryId);
    showThankYou(enquiryId, deliveryStatus);
    return;
  }

  if (statusEl) {
    statusEl.textContent =
      `We are sending your enquiry securely. Enquiry ID: ${enquiryId}`;
    statusEl.classList.add("form-error");
  }
  setTimeout(() => form.submit(), 400);
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

document.querySelector("#trackingButton")?.addEventListener("click", () => {
  const id = document.querySelector("#trackingId")?.value.trim();
  const status = document.querySelector("#trackingStatus");
  if (!status) return;

  if (!id) {
    status.textContent = "Please enter your enquiry or consignment ID.";
    status.classList.add("form-error");
    return;
  }

  status.classList.remove("form-error");
  status.textContent = `Tracking request noted for ${id}. For live status, call or WhatsApp +91 9338888550.`;
});

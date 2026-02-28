console.log("TERRA_CHECKOUT_PIXEL_V5.0_ACTIVE");

/* ================== ENV ================== */

var TERRA_ENV = "prod"; // "dev" | "prod"
var ENDPOINT = "https://pixel-ingest-prod-279703303694.us-central1.run.app/v2/track";
/* var ENDPOINT = "https://pixel-ingest-dev-600339193870.us-central1.run.app/v2/track"; */

/* ================== RUNTIME ================== */

console.log("PROD PIXEL RUNTIME MARKER v5.0 —", Date.now());

window.__terra_prod_runtime_probe__ = {
  ts: Date.now(),
  env: TERRA_ENV
};

/* ================== UTILS ================== */

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    var v = c === "x" ? r : (r & 3 | 8);
    return v.toString(16);
  });
}

function getCookie(name) {
  try {
    var cookies = document.cookie ? document.cookie.split(";") : [];
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.indexOf(name + "=") === 0) {
        return decodeURIComponent(c.substring(name.length + 1));
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

function safeCookie(name) {
  try {
    var v = getCookie(name);
    if (v === "" || v == null) return null;
    return v;
  } catch (e) {
    return null;
  }
}

function digits(x) {
  return String(x || "").replace(/\D/g, "");
}

function getShopifyCustomerId(checkout) {
  if (!checkout) return null;

  var id =
    (checkout.customer && checkout.customer.id) ||
    (checkout.order &&
      checkout.order.customer &&
      checkout.order.customer.id) ||
    null;

  return id ? String(id) : null;
}

function getShopifyClientId(ev) {
  var cid = ev && (ev.clientId || ev.client_id);
  if (!cid || typeof cid !== "string") return null;
  return cid;
}

function getAttr(key, attrs) {
  if (!attrs || !attrs.length) return null;
  for (var i = 0; i < attrs.length; i++) {
    if (attrs[i] && attrs[i].key === key) return attrs[i].value;
  }
  return null;
}

function getAttrAny(keys, attrs) {
  for (var i = 0; i < keys.length; i++) {
    var v = getAttr(keys[i], attrs);
    if (v != null && v !== "") return v;
  }
  return null;
}

function post(payload) {
  try {
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify(payload)
    });
  } catch (e) {}
}

function normalizeGaClientId(v) {
  if (!v || typeof v !== "string") return null;

  // GA cookie format: GA1.1.1234567890.1234567890
  if (v.indexOf("GA") === 0) {
    var parts = v.split(".");
    if (parts.length >= 4) {
      return parts[2] + "." + parts[3];
    }
  }

  return v;
}

function resolveGaClientId(attrs) {
  // PRIMARY — your mirrored attributes (correct path)
  var cid = getAttrAny(
    ["ga_client_id", "ga4_client_id", "terra_ga_cid"],
    attrs
  );

  if (cid) return normalizeGaClientId(cid);

  // FALLBACK — rare safety net only
  try {
    var gaCookie = getCookie("_ga");
    if (gaCookie) return normalizeGaClientId(gaCookie);
  } catch (e) {}

  return null;
}

function resolveGaClientIdFromCookies() {
  try {
    var gaCookie = getCookie("_ga");
    if (!gaCookie) return null;
    return normalizeGaClientId(gaCookie);
  } catch (e) {
    return null;
  }
}

/* ================== TERRA CTX FROM ATTRS ================== */

function getTerraCtx(attrs) {
  function g(k){ return getAttr(k, attrs); }

  return {
    ctx_id: g("ctx_id"),
    th_vid: g("th_vid"),
    session_key: g("session_key"),
    session_start: g("session_start"),

    terra_ft_source: g("terra_ft_source"),
    terra_ft_medium: g("terra_ft_medium"),
    terra_ft_campaign: g("terra_ft_campaign"),
    terra_ft_content: g("terra_ft_content"),
    terra_ft_term: g("terra_ft_term"),
    terra_ft_id: g("terra_ft_id"),

    terra_lt_source: g("terra_lt_source"),
    terra_lt_medium: g("terra_lt_medium"),
    terra_lt_campaign: g("terra_lt_campaign"),
    terra_lt_content: g("terra_lt_content"),
    terra_lt_term: g("terra_lt_term"),
    terra_lt_id: g("terra_lt_id"),

    terra_gclid: g("terra_gclid"),
    terra_gbraid: g("terra_gbraid"),
    terra_wbraid: g("terra_wbraid"),
    terra_msclkid: g("terra_msclkid"),
    terra_fbclid: g("terra_fbclid"),
    terra_ttclid: g("terra_ttclid")
  };
}

/* ================== BASE PAYLOAD ================== */

function basePayload(event_name, ev) {
  var checkout = ev.data && ev.data.checkout ? ev.data.checkout : null;

  // hardening attributes; location varies by runtime
  var attrs = [];
  
  if (checkout) {
    attrs =
      checkout.attributes ||
      checkout.customAttributes ||
      checkout.noteAttributes ||
      [];
  }

  var terra = getTerraCtx(attrs);
  var customerId = getShopifyCustomerId(checkout);
  if (customerId && !/^\d+$/.test(customerId)) {
    customerId = null;
  }

  /* ================== CRITICAL HARDENING — handles Shop Pay / wallet gaps ================== */

  if (!terra.ctx_id && typeof window !== "undefined") {
    try {
      if (window && typeof window.terraGetCTX === "function") {
        var live = window.terraGetCTX();
        if (live && live.ctx_id) {
          terra = live;
        }
      }
    } catch (e) {}

    // secondary cookie fallback
    if (!terra.ctx_id) {
      terra.ctx_id = getCookie("ctx_id");
      terra.th_vid = terra.th_vid || getCookie("th_vid");
      terra.session_key = terra.session_key || getCookie("session_key");
      terra.session_start = terra.session_start || getCookie("session_start");
    }
  }

  /* ========================================================= */

  var ga_client_id = resolveGaClientId(attrs);
  var ga_session_id = getAttrAny(
    ["ga_session_id", "ga4_session_id", "terra_ga_sid"],
    attrs
  );
  var ga_session_number = getAttrAny(
    ["ga_session_number", "ga4_session_number", "terra_ga_sn"],
    attrs
  );

  return {
    data_source: "shopify_checkout_pixel",
    event_name: event_name,
    event_id: ev.id ? String(ev.id) : uuidv4(),
    event_time: ev.timestamp || new Date().toISOString(),
    checkout_id: checkout ? checkout.id : null,

    user_id: customerId,
    shopify_customer_id: customerId,
    shopify_client_id: getShopifyClientId(ev),

    ga_client_id: ga_client_id,
    ga_session_id: ga_session_id,
    ga_session_number: ga_session_number,

    ctx_id: terra.ctx_id,
    th_vid: terra.th_vid,
    session_key: terra.session_key,
    session_start: terra.session_start,

    terra_ft_source: terra.terra_ft_source,
    terra_ft_medium: terra.terra_ft_medium,
    terra_ft_campaign: terra.terra_ft_campaign,
    terra_ft_content: terra.terra_ft_content,
    terra_ft_term: terra.terra_ft_term,
    terra_ft_id: terra.terra_ft_id,

    terra_lt_source: terra.terra_lt_source,
    terra_lt_medium: terra.terra_lt_medium,
    terra_lt_campaign: terra.terra_lt_campaign,
    terra_lt_content: terra.terra_lt_content,
    terra_lt_term: terra.terra_lt_term,
    terra_lt_id: terra.terra_lt_id,

    terra_gclid: terra.terra_gclid,
    terra_gbraid: terra.terra_gbraid,
    terra_wbraid: terra.terra_wbraid,
    terra_msclkid: terra.terra_msclkid,
    terra_fbclid: terra.terra_fbclid,
    terra_ttclid: terra.terra_ttclid,

    raw: ev
  };
}

/* ================== STOREFRONT BASE PAYLOAD ================== */

function storefrontBasePayload(event_name, ev) {
  var terra = getTerraFromWindow();

  return {
    data_source: "shopify_web_pixel",
    event_name: event_name,
    event_id: ev && ev.id ? String(ev.id) : uuidv4(),
    event_time: ev && ev.timestamp ? ev.timestamp : new Date().toISOString(),

    ga_client_id: resolveGaClientIdFromCookies(),  // ← NEW (required)

    shopify_client_id: getShopifyClientId(ev), // ← ADD THIS

    ctx_id: terra.ctx_id,
    th_vid: terra.th_vid,
    session_key: terra.session_key,
    session_start: terra.session_start,

    terra_ft_source: terra.terra_ft_source,
    terra_ft_medium: terra.terra_ft_medium,
    terra_ft_campaign: terra.terra_ft_campaign,
    terra_ft_content: terra.terra_ft_content,
    terra_ft_term: terra.terra_ft_term,
    terra_ft_id: terra.terra_ft_id,

    terra_lt_source: terra.terra_lt_source,
    terra_lt_medium: terra.terra_lt_medium,
    terra_lt_campaign: terra.terra_lt_campaign,
    terra_lt_content: terra.terra_lt_content,
    terra_lt_term: terra.terra_lt_term,
    terra_lt_id: terra.terra_lt_id,

    terra_gclid: terra.terra_gclid,
    terra_gbraid: terra.terra_gbraid,
    terra_wbraid: terra.terra_wbraid,
    terra_msclkid: terra.terra_msclkid,
    terra_fbclid: terra.terra_fbclid,
    terra_ttclid: terra.terra_ttclid,
    terra_landing_page: terra.terra_landing_page,
    terra_referrer: terra.terra_referrer,

    raw: ev
  };
}

/* ================== CHECKOUT EVENTS ================== */

[
  "checkout_started",
  "checkout_contact_info_submitted",
  "checkout_address_info_submitted",
  "checkout_shipping_info_submitted",
  "payment_info_submitted"
].forEach(function (name) {
  analytics.subscribe(name, function (ev) {
    if (!ev || !ev.data || !ev.data.checkout) return;
    post(basePayload(name, ev));
  });
});

/* ================== PURCHASE ================== */

analytics.subscribe("checkout_completed", function (ev) {
  if (!ev || !ev.data || !ev.data.checkout) return;

  var checkout = ev.data.checkout;
  var payload = basePayload("checkout_completed", ev);

  var order = checkout.order || null;
  var txn = null;

  if (order && order.id != null) {
    txn = digits(order.id);
  }

  payload.transaction_id = txn;

  post(payload);
});

/* ================== STOREFRONT EVENTS ================== */

function getTerraFromWindow() {
  var t = {};

  try {
    if (window && typeof window.terraGetCTX === "function") {
      var live = window.terraGetCTX();
      if (live && live.ctx_id) t = live;
    }
  } catch (e) {}

  if (!t || !t.ctx_id) {
    t = (window && (window.terra_ctx || window.terra)) || {};
  }

  return {
    ctx_id: t.ctx_id || safeCookie("ctx_id"),
    th_vid: t.th_vid || safeCookie("th_vid"),
    session_key: t.session_key || safeCookie("session_key"),
    session_start: t.session_start || safeCookie("session_start"),

    terra_ft_source: t.terra_ft_source || safeCookie("terra_ft_source"),
    terra_ft_medium: t.terra_ft_medium || safeCookie("terra_ft_medium"),
    terra_ft_campaign: t.terra_ft_campaign || safeCookie("terra_ft_campaign"),
    terra_ft_content: t.terra_ft_content || safeCookie("terra_ft_content"),
    terra_ft_term: t.terra_ft_term || safeCookie("terra_ft_term"),
    terra_ft_id: t.terra_ft_id || safeCookie("terra_ft_id"),

    terra_lt_source: t.terra_lt_source || safeCookie("terra_lt_source"),
    terra_lt_medium: t.terra_lt_medium || safeCookie("terra_lt_medium"),
    terra_lt_campaign: t.terra_lt_campaign || safeCookie("terra_lt_campaign"),
    terra_lt_content: t.terra_lt_content || safeCookie("terra_lt_content"),
    terra_lt_term: t.terra_lt_term || safeCookie("terra_lt_term"),
    terra_lt_id: t.terra_lt_id || safeCookie("terra_lt_id"),

    terra_gclid: t.terra_gclid || safeCookie("terra_gclid"),
    terra_gbraid: t.terra_gbraid || safeCookie("terra_gbraid"),
    terra_wbraid: t.terra_wbraid || safeCookie("terra_wbraid"),
    terra_msclkid: t.terra_msclkid || safeCookie("terra_msclkid"),
    terra_fbclid: t.terra_fbclid || safeCookie("terra_fbclid"),
    terra_ttclid: t.terra_ttclid || safeCookie("terra_ttclid"),

    terra_landing_page: safeCookie("terra_landing_page"),
    terra_referrer: safeCookie("terra_referrer")
  };
}

[
  "page_viewed",
  "product_viewed",
  "collection_viewed",
  "product_added_to_cart",
  "product_removed_from_cart",
  "search_submitted",
  "cart_viewed"
].forEach(function (name) {
  analytics.subscribe(name, function (ev) {
    if (!ev) return;
    post(storefrontBasePayload(name, ev));
  });
});
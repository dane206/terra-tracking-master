# `00-terra-gtm-loader.liquid`
## 🔒 status: locked.
## ✅ no further changes required.

What was verified:
- Queue works pre-GTM
- Flush works post-GTM
- Identity deferral is safe
- Closure bug is fixed
- Payload override protection is in place
- Idempotency guard present

# `01-terra-attribution-ready.liquid`
## 🔒 status: locked.
## ✅ no further changes required.

Purpose:
- Persist FIRST touch (`terra_ft_*`) for long-term attribution; first-touch write-once logic correct
- Persist LAST touch (`terra_lt_*`) for last campaign/ad they engaged; last-touch overwrite logic correct
- Persist click IDs (`terra_gclid`, `terra_fbclid`, `terra_ttclid`, etc.)
- Persist landing page + referrer once (`terra_landing_page`, `terra_referrer`)

Key Guarantees:
- Cookie writes are guarded (never writes empty values)
- URL params are normalized to null (never "")
- Supports click-only traffic via source/medium synthesis
- No dependency on ctx (cookie-only layer)
- Works across ALL terrahealthessentials.com subdomains via `Domain=.terrahealthessentials.com`; root domain logic correct
- Safe fallback to host-only cookies on non-terra hosts (e.g., *.myshopify.com)

Load Order:
- Must run early (before identity ssot reads cookies into ctx)
- dataLayer push only fires when attribution signal exists
- This file is the single source of truth (`attribution ssot`) for terra attribution cookies.

# `02-terra-identity-ssot.liquid`
## 🔒 status: locked.
## ✅ no further changes required.

Current version correctly has:
- hardened session recovery
- cookie mirror for Shopify pixel
- correct `ensure()` behavior
- `ctx cookie` mirror
- `terraWhenReady` present
- identity fired through `terraPushEvent`
- full `ctx contract` intact
- This file is the single source of truth (`identity ssot`) for terra identity cookies.

Terra identity stitching rule final order of priority:
- zero identity drift from storefront → checkout → purchase
- 2/28/26 fully intact; full funnel maintained
✔ `th_vid` → primary identity spine
✔ `shopify_customer_id` → authenticated identity
✔ `terra_ga_cid` → analytics bridge
✔ `shopify_client_id` → opportunistic enrichment; exactly where it belongs
✔ `ctx_id` → context id
✔ `session_key` → terra session identifier
✔ `user_id` → `shopify_customer_id`

# ga4 user-scoped dimensions (3)
## 🔒 status: locked.
## ✅ no further changes required.

Keep only:
- correct for Terra identity model.
* `th_vid`
* `user_id` → `shopify_customer_id`
* `device_type`

# ga4 item-scoped dimensions (3)
## 🔒 status: locked.
## ✅ no further changes required.

Keep:
- correct for Shopify canonical item structure.
* `item_group_id`
* `sku`
* `variant_id`

# ga4 event-scoped dimensions (terra core)
## 🔒 status: locked.
## ✅ no further changes required.

# context ssot + session key
## 🔒 status: locked.
## ✅ no further changes required.

Keep:
* `coupon`
* `ctx_id`
* `event_id`
* `iso_week`
* `page_type`
* `session_key`
* `transaction_id`

# attribution (terra ft/lt backbone)
## 🔒 status: locked.
## ✅ no further changes required.

Keep:
* `terra_ft_source`
* `terra_ft_medium`
* `terra_ft_campaign`
* `terra_lt_source`
* `terra_lt_medium`
* `terra_lt_campaign`

# strategic note
## 🔒 status: locked.
## ✅ no further changes required.

You should now have:
* **user-scoped:** 3
* **item-scoped:** 3
* **event-scoped:** 13
- You are now in a clean state.

This set is:
* minimal
* non-redundant
* aligned to your Terra SSOT
* safe for long-term GA4 limits
* compatible with your BigQuery-first strategy

# theme render-layer layout
## 🔒 status: locked.
## ✅ no further changes required.

```liquid
    {% render '00-terra-gtm-loader' %}
    {% render '01-terra-attribution-ready' %}
    {% render '02-terra-identity-ssot' %}
    {% render '03-terra-item-utils' %}
    {% render '04-terra-checkout-bridge' %}
    {% render '05-terra-page-view-producer' %}

    {% if request.page_type == 'product' %}
      {% render '06-terra-view-item-producer' %}
      {% render '07-terra-add-to-cart-producer' %}
    {% endif %}

    {% if request.page_type == 'collection' %}
      {% render '08-terra-view-item-list-collection' %}
    {% endif %}

    {% if request.page_type == 'search' %}
      {% render '09-terra-view-item-list-search' %}
    {% endif %}

    {% render '10-terra-user-authenticated' %}
```

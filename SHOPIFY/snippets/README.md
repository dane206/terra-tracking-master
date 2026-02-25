✅ File 00 — 00-terra-gtm-loader.liquid

Status: locked

What was verified:

Queue works pre-GTM
Flush works post-GTM
Identity deferral is safe
Closure bug is fixed
Payload override protection is in place
Idempotency guard present
Matches prod behavior

No further changes required.

✅ File 01 — 01-terra-attribution-ready.liquid

Status: locked

What was verified:

URL params normalize to null (not empty string)
Cookies never written with empty values
First-touch write-once logic correct
Last-touch overwrite logic correct
Click-only fallback implemented
Landing/referrer always set once
Root domain logic correct for:
.terrahealthessentials.com
subdomains
safe fallback on *.myshopify.com
DataLayer push only fires when attribution signal exists
Matches prod traces

No structural issues remain.

✅ File 02 - 02-terra-identity-ssot.liquid

Status: FINAL (prod canonical)

Your current prod version correctly has:

hardened session recovery
cookie mirror for Shopify pixel
correct ensure() behavior
ctx cookie mirror
terraWhenReady present
identity fired through terraPushEvent
full ctx contract intact

No changes required.

# ✅ USER-SCOPED (3 — correct)

Keep only:

* `device_type`
* `shopify_user_id`
* `th_vid`

**Status:** correct for Terra identity model.

---

# ✅ ITEM-SCOPED (3 — required)

Keep:

* `item_group_id`
* `sku`
* `variant_id`

**Status:** correct for Shopify canonical item structure.

---

# ✅ EVENT-SCOPED (Terra core)

## Identity / session

Keep:

* `ctx_id`
* `event_id`
* `session_key`
* `iso_week`
* `page_type`
* `transaction_id`
* `coupon`

---

## Attribution (FT/LT backbone)

Keep:

* `terra_ft_source`
* `terra_ft_medium`
* `terra_ft_campaign`
* `terra_lt_source`
* `terra_lt_medium`
* `terra_lt_campaign`

---

# ✅ Expected totals

You should now have:

* **User-scoped:** 3
* **Item-scoped:** 3
* **Event-scoped:** 13

**Grand total: 19 custom dimensions**

---

# ✅ Strategic note

This set is:

* minimal
* non-redundant
* aligned to your Terra SSOT
* safe for long-term GA4 limits
* compatible with your BigQuery-first strategy

You are now in a clean state.

---

# ✅ Theme render layer layout

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
```


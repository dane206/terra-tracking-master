```md
├── .gitignore
├── BIGQUERY
│   └── raw-events-schema.json
├── CLOUD-RUN
│   └── pixel-ingest
│       ├── .env.example
│       ├── adapters
│       │   ├── bigquery.adapter.js
│       │   └── ga4.adapter.js
│       ├── Dockerfile
│       ├── index.js
│       ├── package.json
│       ├── routes
│       │   └── track.js
│       └── schemas
│           └── raw-events.schema.json
├── CONTRACT
│   └── terra-master-contract-v1.md
├── GTM
│   └── container-export
│       └── terra-gtm-container.json ✅
├── QA
│   ├── checklists
│   │   ├── debug-playbook.md
│   │   └── launch-checklist.md
│   └── queries
│       ├── ctx-id-audit.sql
│       ├── event-parity.sql
│       └── funnel-reconciliation.sql
├── README.md
├── SHOPIFY
│   └── snippets
│       ├── 00-terra-gtm-loader.liquid
│       ├── 01-terra-attribution-ready.liquid ✅
│       ├── 02-terra-identity-ssot.liquid
│       ├── 03-terra-item-utils.liquid
│       ├── 04-terra-checkout-bridge.liquid
│       ├── 05-terra-page-view-producer.liquid
│       ├── 06-terra-view-item-producer.liquid
│       ├── 07-terra-add-to-cart-producer.liquid
│       ├── 08-terra-view-item-list-collection.liquid
│       ├── 09-terra-view-item-list-search.liquid
│       └── 10-terra-user-authenticated.liquid
└── WEB-PIXEL
    └── extension
        ├── dist
        ├── package.json
        ├── shopify.extension.toml
        └── src
            ├── checkout-events.js
            ├── index.js
            └── web-events.js

19 directories, 34 files
```
# Collection Popularity Sorter

A Shopify embedded admin app that reorders collection products by recent sales, using merchant-selected date windows instead of Shopify's default all-time best-selling sort.

## Stack

- Shopify React Router app template
- TypeScript
- Shopify Admin GraphQL API only
- Shopify App Bridge
- Shopify Polaris / Polaris Web Components
- Prisma ORM
- PostgreSQL for production
- SQLite can be used locally by changing the Prisma datasource provider if needed
- Zod and date-fns

## Required Scopes

Set these scopes in Shopify and in `SCOPES`:

```txt
read_products,write_products,read_orders,read_all_orders
```

`read_all_orders` requires Shopify approval. Without it, Shopify can limit access to older order data. The app warns merchants that 90-day and 1-year reports may be incomplete unless webhook-based aggregates have already captured enough history after installation.

## Setup

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

Update `shopify.app.toml` with the app's client ID and URLs, or let Shopify CLI update URLs during local development.

## Database

Production should use PostgreSQL:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

For local SQLite development, switch `provider = "postgresql"` to `provider = "sqlite"` in `prisma/schema.prisma`, then use:

```env
DATABASE_URL=file:./dev.sqlite
```

## Development Notes

- Routes call `authenticate.admin(request)` before touching Shopify Admin API data.
- Access tokens stay server-side.
- Sorting previews never reorder products.
- Applying a sort first switches the collection to manual sort order, then sends only changed product moves to `collectionReorderProducts`.
- Move batches are split at Shopify's 250-move limit and each returned job is polled.
- Order webhooks store normalized order snapshots and refresh daily aggregate rows. The on-demand order query is the MVP source for immediate previews and initial runs.

## Deployment Notes

- Run `npm run build`.
- Run `prisma migrate deploy` during release.
- Configure privacy compliance webhook URLs in Shopify.
- Review and request `read_all_orders` before promising 90-day or 1-year accuracy for historical data.

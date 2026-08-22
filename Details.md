# FRIMA — P0 Build Roadmap

---

## 1. What FRIMA Is (Plain English)

FRIMA is a private investment portal. Think of it as a matchmaking platform between **startups looking for money** and **investors looking for deals**, with a **FRIMA team running the show in the background**.

Three kinds of people use it:

1. **Startups (Companies)** — they sign up, fill out a profile about their business, and that's their world. They can't see other startups, and they definitely can't see who the investors are.
2. **Investors / Investment Bankers** — they sign up, browse a list of investment opportunities (the startups FRIMA has published), and can see the financial details of each — but not private info like the startup's contact details, unless FRIMA specifically grants them access (Deal Room).
3. **Admins (FRIMA team / Directors)** — they see everything. They manage which startups become "opportunities," manage investors, track customers and sales, and run the whole platform from a dashboard.

The core idea: **startups put deals in, investors browse and get matched, admins control who sees what and keep the whole thing secure.**

---

## 2. Role-by-Role Breakdown

### 🟦 Admin (FRIMA Team / Director)
The admin is the operator of the platform. As an admin, you:
- Log in with an extra security step (2FA code sent to your email/phone).
- Land on a dashboard showing: total companies, total users, active users, logins in the last 24 hours, and how each "subsidiary" (sub-brand/division of FRIMA) is performing.
- Create and manage **subsidiaries** — just a name and optional description.
- Create and manage **users** — including which role they get (admin, investor, or startup) and what they can access.
- Turn a startup's submission into a published **"Opportunity"** — write it up, assign a category (FinTech, real estate, agriculture, etc.), and decide whether it's visible to investors yet.
- Manage a **CRM of customers** — see who they are, their contact number, WhatsApp, how they were sourced, what they've bought, and their sales history.
- See **analytics** — portfolio performance, revenue trends, engagement, retention.
- Control **Deal Room permissions** — decide which investor sees which confidential document for which opportunity.
- See a full **audit trail** — who did what, when.

### 🟩 Investor / Investment Banker
As an investor, the experience is deliberately kept simple:
- Register with just the essentials: name, phone, email, how much you're looking to invest, and which industries interest you.
- Log in with extra security (2FA) since you're dealing with financial data.
- Land on a single, simple dashboard — your portfolio overview, nothing cluttered.
- Browse the **Opportunities Marketplace** — a curated list of investment deals, filterable by category.
- Open any opportunity to see its financial details (expected revenue, stage, industry, etc.) — but **not** the startup's name, contact info, or other confidential details, unless FRIMA has explicitly unlocked that "Deal Room" for you.
- If you decide to invest, FRIMA hands you off to an **external execution platform** to actually complete the transaction — you're redirected out to a partner provider.
- You cannot see any other investor's identity or activity — ever.

### 🟨 Startup / Company
As a startup, your experience is the narrowest and most self-contained:
- Register your company (name, industry, description, etc.).
- Fill in your own company insights/profile — that's the whole job.
- You cannot see any other startup, any investor, or any admin-only data.
- Once submitted, FRIMA's admin team reviews it and decides whether/how to publish it as an "Opportunity" for investors to see.

---

## 3. Tech Stack

| Layer | Choice | Why / Role |
|---|---|---|
| Frontend | **Next.js** | Renders UI, calls **your own backend API only** — never talks to Supabase directly for data |
| Backend | **Node.js + Express** | Owns *all* business logic and *all* database access. Every read/write goes through here. |
| Database | **Supabase (Postgres)** | Just the data store — accessed only via the backend using the **service role key** |
| Auth | **Supabase Auth** | Handles sign-up/login/session/2FA/token issuing — but your Express backend still validates every request and enforces role logic before touching data |

**The one rule that shapes everything:** the frontend never queries Supabase directly and never holds a Supabase key that can read/write data. It only ever calls your Express API. Supabase Auth is used for *identity* (issuing a JWT), but your backend is the only thing that uses that JWT to decide what data comes back. This keeps a single, auditable choke point for every piece of business logic — which matters a lot given the financial/confidential nature of this data (and lines up directly with FR-52 Audit Trail and FR-53 Encryption).

Practically: Next.js calls `POST /api/auth/login` → Express calls Supabase Auth → Express returns a session token to the frontend → every subsequent frontend request sends that token to Express → Express verifies it (via Supabase Admin SDK) and *then* decides what data to return based on role.

---

## 4. Database Structure

### Design decision: how to store "role"
You asked me to decide between a few approaches for handling the three roles (admin / investor / startup). Here's the call, and why:

**Recommendation: a single `role` column (enum) on `profiles`, not separate boolean flags and not a separate roles table.**

- Booleans (`is_admin`, `is_investor`, `is_startup`) invite bugs — nothing stops someone from being both `true`, which shouldn't be possible in this product (a person is exactly one type of user).
- A separate many-to-many roles table is the "textbook correct" answer for apps where users can hold multiple roles — but nothing in FRIMA needs that. Every user in your transcript is exactly one type, permanently, from signup.
- A single enum column (`role: 'admin' | 'investor' | 'startup'`) is simplest, fastest to query, trivial to enforce in middleware (`req.user.role === 'admin'`), and matches reality. If FRIMA ever needs multi-role users later, you migrate then — don't build for a case you don't have.

### Core Tables (P0 scope)

**`profiles`** *(1:1 with Supabase `auth.users`)*
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK, = auth.users.id) | |
| role | enum: admin, investor, startup | |
| full_name | text | |
| phone | text | |
| status | enum: active, suspended, pending | |
| mfa_enabled | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**`subsidiaries`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text (required) | |
| description | text (optional) | |
| created_by | uuid → profiles.id | |
| created_at | timestamptz | |

**`companies`** *(startup profiles)*
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| profile_id | uuid → profiles.id | owner (the startup user) |
| subsidiary_id | uuid → subsidiaries.id (nullable) | |
| company_name | text | |
| industry | text | |
| description | text | |
| website | text (nullable) | |
| stage | text (e.g. seed, growth) | |
| created_at | timestamptz | |

**`investors`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| profile_id | uuid → profiles.id | |
| investment_min | numeric | |
| investment_max | numeric | |
| preferred_industries | text[] | |
| kyc_status | enum: pending, verified, rejected | |
| created_at | timestamptz | |

**`opportunities`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| company_id | uuid → companies.id | |
| subsidiary_id | uuid → subsidiaries.id | |
| title | text | |
| category | text (FinTech, Real Estate, Agriculture, etc.) | |
| description | text | |
| expected_revenue | numeric | |
| currency | text | |
| stage | text (pipeline stage) | |
| status | enum: draft, published, archived | |
| created_by | uuid → profiles.id (admin) | |
| created_at | timestamptz | |

**`deal_room_documents`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| opportunity_id | uuid → opportunities.id | |
| file_url | text | stored in Supabase Storage, path only here |
| file_type | text | |
| visibility | enum: public, granted_only, admin_only | |
| uploaded_by | uuid → profiles.id | |
| created_at | timestamptz | |

**`deal_room_permissions`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| opportunity_id | uuid → opportunities.id | |
| investor_id | uuid → investors.id | |
| granted_by | uuid → profiles.id (admin) | |
| granted_at | timestamptz | |

**`customers`** *(CRM — admin/director side)*
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| subsidiary_id | uuid → subsidiaries.id | |
| name | text | |
| contact_number | text | |
| whatsapp_number | text | |
| source | text | how they were acquired |
| created_at | timestamptz | |

**`customer_sales`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| customer_id | uuid → customers.id | |
| product | text | |
| amount | numeric | |
| currency | text | |
| sold_at | timestamptz | |

**`external_handoffs`** *(FR-28)*
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| investor_id | uuid → investors.id | |
| opportunity_id | uuid → opportunities.id | |
| provider | text | which external platform |
| redirect_url | text | |
| status | enum: initiated, completed, failed | |
| created_at | timestamptz | |

**`audit_logs`** *(FR-52)*
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| actor_id | uuid → profiles.id | |
| action | text | e.g. "opportunity.published" |
| entity_type | text | |
| entity_id | uuid | |
| metadata | jsonb | |
| created_at | timestamptz | |

> Every table is only ever touched via the Express backend using the Supabase **service role key**. Row Level Security can stay on in Supabase as a safety net, but it is not your primary access control layer — Express is.

---

## 5. Folder Structure

### Backend (Express, feature-based)
```
backend/
  src/
    config/
      supabase.js          # service-role client, never exposed to frontend
      env.js
    middleware/
      authenticate.js       # verifies Supabase JWT
      authorize.js           # role guard (admin/investor/startup)
      errorHandler.js
      auditLogger.js
    modules/
      auth/
        auth.routes.js
        auth.controller.js
        auth.service.js
      admin/
        admin.routes.js
        admin.controller.js
        admin.service.js
      subsidiaries/
      companies/
      investors/
      opportunities/
        opportunities.routes.js
        opportunities.controller.js
        opportunities.service.js
        opportunities.validation.js
      dealroom/
      crm/
      audit/
    utils/
    app.js
    server.js
  package.json
```

### Frontend (Next.js)
```
frontend/
  app/
    (admin)/
      dashboard/
      opportunities/
      users/
      crm/
    (investor)/
      dashboard/
      marketplace/
      opportunity/[id]/
    (startup)/
      dashboard/
      profile/
    (auth)/
      login/
      register/
  components/
    ui/
    layout/
  lib/
    api-client.ts          # thin wrapper around fetch() to your Express API — no Supabase calls here
  hooks/
  types/
```

---

## 6. Build Order (Phased Roadmap)

1. **Foundations** — repo setup, Supabase project, Express skeleton with `authenticate`/`authorize` middleware, Next.js skeleton, env config.
2. **Auth & Roles** — FR-01, 02, 03, 04, 05. Nothing else works without this.
3. **Admin Core** — FR-33, 34, 35. You need this to create subsidiaries, manage users, and publish opportunities before there's anything for investors/startups to see.
4. **Startup + Opportunities** — companies table, opportunity creation/publishing, categories, detail page (FR-18, 19, 20).
5. **Investor Experience** — dashboard, portfolio overview, marketplace browsing (FR-06, 07).
6. **Deal Room** — permissioned documents (FR-24, 25).
7. **CRM + External Handoff** — customer records, sales tracking, investment execution handoff (FR-30, 28).
8. **Security & Infra Hardening** — audit trail, encryption, hosting selection, backup/DR (FR-52, 53, 54, 55). Some of this (encryption at rest, backups) is largely infra config on Supabase/hosting side, but audit trail is app-level and should be wired in from step 2 onward, not bolted on at the end.

This order exists because every later phase depends on something earlier: you can't have opportunities without admins to publish them, and you can't have investors browsing without opportunities to browse.
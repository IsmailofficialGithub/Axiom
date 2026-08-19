# API Endpoints & Contracts

*All calls from Next.js go to these Express routes.*

## Auth (`/api/auth`)
- `POST /login`: Authenticates with Supabase Auth, returns JWT.
- `POST /register`: Creates user.
- `POST /mfa/...`: 2FA setup and verification.

## Admin (`/api/admin`)
- `GET /dashboard`: Platform metrics.
- `GET /users`, `POST /users`: Manage platform users.
- `GET /subsidiaries`, `POST /subsidiaries`: Manage subsidiaries.

## Opportunities (`/api/opportunities`)
- `GET /`: List published opportunities (Investors) or all (Admins).
- `POST /`: Create an opportunity from a company profile.
- `GET /:id`: Opportunity details.

## Deal Room (`/api/dealroom`)
- `GET /:opportunity_id`: Fetch documents (checks permissions).
- `POST /grant`: Admin grants access to an investor.

## CRM (`/api/crm`)
- `GET /customers`, `POST /customers`: Manage customers.
- `POST /sales`: Record sales.

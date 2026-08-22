# Security & Permissions

## Core Principles
1. **No direct DB access from frontend**. Express handles all interactions using the Supabase Service Role Key.
2. **Role-Based Access Control (RBAC)**: Handled entirely in Express middleware (`authorize.js`).

## Authentication
- Handled by Supabase Auth, but tokens are validated by Express (`authenticate.js`).
- **2FA/MFA**: Mandatory for Admins and Investors due to the financial and confidential nature of the data.

## Data Visibility
- **Startups**: Can only see and edit their own `companies` record.
- **Investors**: Can see `opportunities` but NOT sensitive contact info. Deal Room documents are only visible if explicitly granted in `deal_room_permissions`. Cannot see other investors.
- **Admins**: Full read/write access across all tables.

## Auditing & Hardening
- **Audit Logs**: Every action must be recorded in `audit_logs` (FR-52) with actor, action, and metadata.
- **Encryption**: Encryption at rest (FR-53) provided by Supabase/hosting infrastructure.

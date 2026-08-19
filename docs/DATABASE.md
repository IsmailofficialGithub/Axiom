# Database Schema & Conventions

*Note: The database is strictly accessed via the backend using the service role key.*

## Core Tables (P0)

1. **`profiles`**: `id` (uuid, auth.users.id), `role` (enum: admin, investor, startup), `full_name`, `phone`, `status`, `mfa_enabled`.
2. **`subsidiaries`**: `id`, `name`, `description`, `created_by`.
3. **`companies`** (Startups): `id`, `profile_id`, `subsidiary_id`, `company_name`, `industry`, `description`, `website`, `stage`.
4. **`investors`**: `id`, `profile_id`, `investment_min`, `investment_max`, `preferred_industries`, `kyc_status`.
5. **`opportunities`**: `id`, `company_id`, `subsidiary_id`, `title`, `category`, `description`, `expected_revenue`, `currency`, `stage`, `status` (draft, published, archived).
6. **`deal_room_documents`**: `id`, `opportunity_id`, `file_url`, `file_type`, `visibility` (public, granted_only, admin_only), `uploaded_by`.
7. **`deal_room_permissions`**: `id`, `opportunity_id`, `investor_id`, `granted_by`.
8. **`customers`** (CRM): `id`, `subsidiary_id`, `name`, `contact_number`, `whatsapp_number`, `source`.
9. **`customer_sales`**: `id`, `customer_id`, `product`, `amount`, `currency`, `sold_at`.
10. **`external_handoffs`**: `id`, `investor_id`, `opportunity_id`, `provider`, `redirect_url`, `status`.
11. **`audit_logs`**: `id`, `actor_id`, `action`, `entity_type`, `entity_id`, `metadata`.

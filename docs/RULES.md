# AI Agent & Developer Rules

## 1. Architectural Constraint (THE GOLDEN RULE)
- **The frontend NEVER queries Supabase directly.**
- **The frontend NEVER holds a Supabase key that can read/write data.**
- The frontend ONLY calls the Express API.
- All Supabase interactions must happen in the Express backend using the `service_role` key.

## 2. Authentication & Authorization
- Supabase Auth is for identity only (issuing JWTs).
- The Express backend MUST validate every request and enforce role logic (`admin`, `investor`, `startup`) before returning data.
- The single choke point ensures audibility (FR-52) and security.

## 3. Database Design
- Do not use boolean flags for roles (`is_admin`, etc.).
- Use a single `role` enum column on the `profiles` table: `admin | investor | startup`.
- Every DB interaction must be mediated by Express.

## 4. UI/UX
- Admins get a comprehensive dashboard.
- Investors get a simple, uncluttered portfolio and marketplace.
- Startups only see their own profile.

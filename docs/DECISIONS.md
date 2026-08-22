# Architecture & Technical Decisions

## 1. Single Choke Point API
**Decision**: Use an Express.js backend as a middleman rather than Next.js calling Supabase directly.
**Reasoning**: Financial applications require strict, auditable access controls. Having a single Express API ensures every request is logged and validated, preventing any frontend bypasses or RLS misconfigurations.

## 2. Role Storage
**Decision**: Store user roles as a single enum column (`role`) in the `profiles` table.
**Reasoning**:
- Booleans (`is_admin`, `is_startup`) invite bugs where a user might hold multiple true states, which shouldn't be possible.
- Many-to-many role tables are overkill since users hold exactly one role permanently.
- Enum is simple, fast to query, and easy to validate in middleware.

## 3. Separation of Frontend and Backend
**Decision**: Maintain completely separate codebases/folders for Next.js and Express.
**Reasoning**: Encourages strict boundary separation, ensuring frontend UI code can never accidentally import or execute privileged backend database logic.

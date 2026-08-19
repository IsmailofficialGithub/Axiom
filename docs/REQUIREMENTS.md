# Functional & Non-Functional Requirements

## Functional Requirements
- **FR-01 to FR-05 (Auth & Roles)**: Sign up, login, session management, 2FA (for Admin/Investors), role assignment.
- **FR-06 to FR-07 (Investor)**: Browse marketplace, view opportunities, filter by category.
- **FR-18 to FR-20 (Startup/Opps)**: Company profiles, opportunity creation, publishing, detail view.
- **FR-24 to FR-25 (Deal Room)**: Permissioned document access.
- **FR-28 (External Handoff)**: Redirect to partner providers for investment execution.
- **FR-30 (CRM)**: Customer records, sales tracking for admins.
- **FR-33 to FR-35 (Admin Core)**: Subsidiary management, user management.
- **FR-52 (Audit Trail)**: Record all actions (who, what, when).

## Non-Functional Requirements
- **Security (FR-53, 54, 55)**: Encryption at rest, backup/DR, strict role-based access control.
- **Simplicity**: Investor experience must be deliberately kept simple.
- **Isolation**: Startups cannot see other startups or investors. Investors cannot see other investors.

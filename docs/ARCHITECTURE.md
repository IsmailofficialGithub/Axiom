# Architecture & System Design

## Overview
FRIMA uses a decoupled architecture ensuring maximum security and a single, auditable choke point for all business logic.

## Components
1. **Frontend (Next.js)**: 
   - Renders UI.
   - Calls the custom backend API ONLY.
   - **Never** communicates with Supabase directly for data.
2. **Backend API (Node.js + Express)**:
   - Contains all business logic, database queries, and role validation.
   - Exposes RESTful endpoints to the frontend.
3. **Database (Supabase / Postgres)**:
   - Data store.
   - Accessed exclusively by the Express backend using the **service role key**.
4. **Authentication (Supabase Auth)**:
   - Next.js calls Express `POST /api/auth/login` -> Express calls Supabase Auth -> Returns session token to frontend.
   - All subsequent requests send the token to Express to be verified.

## Folder Structure
```
backend/
  src/
    config/
    middleware/
    modules/
frontend/
  app/
  components/
  lib/
```

## ADDED Requirements

### Requirement: Setup seeds an authenticated demo workspace
The system SHALL provide an idempotent setup path that creates a demo Supabase user, a local DejaQ user row, a default demo organization, user-org membership, one or two departments, and sample stats data so a new install can sign in and immediately see a populated management dashboard.

The demo user credentials SHALL be `demo@dejaq.local` / `demo1234`. The demo organization SHALL use a stable slug. Demo departments SHALL use stable slugs. Running the seed more than once SHALL NOT duplicate users, organizations, departments, memberships, or sample stat batches.

#### Scenario: Demo seed creates sign-in user and org
- **WHEN** setup runs with Supabase service credentials configured
- **THEN** Supabase Auth contains a user that can sign in as `demo@dejaq.local` with password `demo1234`
- **THEN** SQLite contains a matching local user row and membership to the default demo organization

#### Scenario: Demo seed creates departments
- **WHEN** the demo seed completes
- **THEN** the default demo organization contains one or two departments with stable names, slugs, and cache namespaces

#### Scenario: Demo seed is idempotent
- **WHEN** the demo seed is run twice
- **THEN** there is still exactly one demo user, one default demo organization, one membership between them, and one row per seeded department

### Requirement: Demo seed populates sample dashboard stats
The system SHALL populate enough sample request-log rows for the default demo organization and departments to make management stats views non-empty immediately after setup. The sample rows SHALL include both cache hits and misses and at least one easy and one hard miss.

Sample stats SHALL be written to `DEJAQ_STATS_DB` using the same `requests` schema used by `RequestLogger`. The seed path SHALL initialize or create that stats schema before inserting sample rows. Seeded rows SHALL have deterministic seed identifiers, for example `response_id` values prefixed with `demo-seed:`, and reruns SHALL replace or skip existing seeded rows so the sample batch count remains stable.

#### Scenario: Demo dashboard has org stats
- **WHEN** the demo user signs in and calls `GET /admin/v1/stats/orgs`
- **THEN** the response includes the default demo organization with non-zero request totals

#### Scenario: Demo dashboard has department stats
- **WHEN** the demo user signs in and calls `GET /admin/v1/stats/orgs/{demo_slug}/departments`
- **THEN** the response includes the seeded departments with non-zero request totals

#### Scenario: Demo stats seed initializes stats schema
- **WHEN** the demo seed runs before FastAPI has created the request-log table
- **THEN** the seed initializes the `DEJAQ_STATS_DB` request-log schema before inserting sample rows

#### Scenario: Demo stats seed is idempotent
- **WHEN** the demo seed is run twice
- **THEN** seeded stats rows are not duplicated
- **THEN** the sample stats batch count remains stable

### Requirement: Supabase setup and demo credentials are documented
`CLAUDE.md` SHALL document the Supabase project setup steps required for local development, the environment variables needed by FastAPI to configure the official Supabase Python SDK, the environment variables or credentials needed for demo user seeding, and the demo credentials `demo@dejaq.local` / `demo1234`.

#### Scenario: Developer can find setup steps
- **WHEN** a developer reads `CLAUDE.md`
- **THEN** they can identify how to configure the Supabase Python SDK for management API JWT validation and user lookup
- **THEN** they can identify how to seed and sign in with the demo user

#### Scenario: Documentation states gateway is unaffected
- **WHEN** a developer reads the management auth documentation in `CLAUDE.md`
- **THEN** it states that `/v1/chat/completions` continues to use DejaQ org API keys instead of Supabase JWTs

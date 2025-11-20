# Infrastructure

This folder tracks infrastructure-as-code assets introduced during Phase 1:

- `database/schema.sql` – canonical PostgreSQL schema used by migrations and CI.
- Future Terraform/Ansible/Pulumi scripts.
- Deployment manifests for staging and production.

All environment-agnostic assets should live here so CI/CD pipelines can reference a single location.


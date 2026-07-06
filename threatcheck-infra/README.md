# ThreatCheck Infra

Infrastructure-as-Code for the ThreatCheck security scanning platform on Azure.

## Structure

```
threatcheck-infra/
├── providers.tf              # Provider configuration + variables
├── versions.tf               # Terraform + provider version constraints
│
├── modules/                  # Reusable building blocks
│   ├── networking/           # VNet, subnets, NSGs
│   ├── aks/                  # AKS cluster + spot node pool
│   ├── acr/                  # Container registry
│   ├── key-vault/            # Secrets management
│   ├── postgres/             # Managed PostgreSQL
│   ├── redis/                # Managed Redis cache
│   ├── storage/              # Blob storage + queues
│   ├── front-door/           # Azure Front Door (CDN + WAF)
│   ├── entra-id/             # Entra ID app registration (SSO)
│   ├── messaging/
│   │   └── azure-service-bus # Scan request + completion queues
│   └── monitoring/           # Log Analytics + Prometheus + Grafana
│
├── environments/
│   ├── dev/                  # Development (example)
│   ├── stage/                # Staging (same structure)
│   └── prod/                 # Production (same structure)
│
├── docs/                     # Documentation
├── .github/workflows/        # CI/CD pipeline reference
└── README.md
```

## Environments

Each environment is a full copy of the modules wired together with environment-specific values:

```
environments/dev/
├── main.tf                   # Module wiring
├── variables.tf              # Input variables
├── outputs.tf                # Connection info
├── locals.tf                 # Tags
├── _supporting.tf            # Random IDs, DNS zones
└── terraform.tfvars          # Values
```

## Usage

```bash
# Plan
cd threatcheck-infra/environments/dev
terraform init
terraform plan -var-file=terraform.tfvars

# Apply
terraform apply -var-file=terraform.tfvars

# Connect to AKS after apply
az aks get-credentials --resource-group tc-rg-dev --name tc-aks-dev
```

## Architecture

```
User ──► Azure Front Door ──► AKS (nginx ingress)
                                  │
                            ┌─────┴──────┐
                            │            │
                      Backend Pod    Scan Job (spot pool)
                            │            │
                      ┌─────┴──────┐     │
                      │            │     │
                 Postgres      Redis    │
                      │                 │
                 Key Vault ◄── Workload Identity
                      │
                 ACR (container images)
```

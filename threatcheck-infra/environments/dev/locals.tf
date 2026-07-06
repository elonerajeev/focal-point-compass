locals {
  tags = {
    Environment = var.environment
    Project     = "threatcheck"
    ManagedBy   = "terraform"
    CostCenter  = "security"
  }
}

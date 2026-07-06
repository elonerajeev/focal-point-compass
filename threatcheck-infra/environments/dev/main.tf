module "networking" {
  source = "../../modules/networking"

  name_prefix              = var.name_prefix
  environment              = var.environment
  location                 = var.location
  resource_group_name      = "${var.name_prefix}-rg-${var.environment}"
  tags                     = local.tags
  vnet_address_space       = ["10.0.0.0/16"]
  aks_subnet_prefixes      = ["10.0.1.0/24"]
  ingress_subnet_prefixes  = ["10.0.2.0/24"]
  private_endpoint_subnet_prefixes = ["10.0.3.0/24"]
}

module "monitoring" {
  source = "../../modules/monitoring"

  name_prefix         = var.name_prefix
  environment         = var.environment
  location            = var.location
  resource_group_name = module.networking.resource_group_name
  tags                = local.tags
  retention_days      = var.environment == "prod" ? 90 : 30
  grafana_sku         = var.environment == "prod" ? "Standard" : "Essential"
}

module "aks" {
  source = "../../modules/aks"

  name_prefix              = var.name_prefix
  environment              = var.environment
  location                 = var.location
  resource_group_name      = module.networking.resource_group_name
  tags                     = local.tags
  aks_subnet_id            = module.networking.aks_subnet_id
  log_analytics_workspace_id = module.monitoring.log_analytics_workspace_id
  kubernetes_version       = var.kubernetes_version
  sku_tier                 = var.environment == "prod" ? "Standard" : "Free"

  system_pool = {
    vm_size         = "Standard_D4ds_v5"
    zones           = ["1", "2", "3"]
    min_count       = 2
    max_count       = 5
    os_disk_size_gb = 80
  }

  scan_pool = {
    vm_size         = "Standard_F8s_v2"
    zones           = ["1", "2", "3"]
    min_count       = 0
    max_count       = 20
    os_disk_size_gb = 60
  }
}

module "acr" {
  source = "../../modules/acr"

  name_prefix         = var.name_prefix
  environment         = var.environment
  location            = var.location
  resource_group_name = module.networking.resource_group_name
  tags                = local.tags
  random_suffix       = random_string.suffix.result
  sku                 = "Premium"
  admin_enabled       = false
}

module "key_vault" {
  source = "../../modules/key-vault"

  name_prefix               = var.name_prefix
  environment               = var.environment
  location                  = var.location
  resource_group_name       = module.networking.resource_group_name
  tags                      = local.tags
  tenant_id                 = var.tenant_id
  random_suffix             = random_string.suffix.result
  private_endpoint_subnet_id = module.networking.private_endpoint_subnet_id
}

module "postgres" {
  source = "../../modules/postgres"

  name_prefix         = var.name_prefix
  environment         = var.environment
  location            = var.location
  resource_group_name = module.networking.resource_group_name
  tags                = local.tags
  aks_subnet_id       = module.networking.aks_subnet_id
  private_dns_zone_id = azurerm_private_dns_zone.postgres.id
  admin_user          = "tcadmin"
  admin_password      = random_password.postgres_admin.result
  postgres_version    = "16"
  sku_name            = var.environment == "prod" ? "GP_Standard_D4s_v3" : "B_Standard_B1ms"
  storage_mb          = var.environment == "prod" ? 131072 : 32768
  backup_retention_days = var.environment == "prod" ? 30 : 7
  availability_zone   = "1"
}

module "redis" {
  source = "../../modules/redis"

  name_prefix         = var.name_prefix
  environment         = var.environment
  location            = var.location
  resource_group_name = module.networking.resource_group_name
  tags                = local.tags
  capacity            = var.environment == "prod" ? 2 : 1
  family              = "C"
  sku                 = var.environment == "prod" ? "Standard" : "Basic"
  redis_version       = "7"
}

module "storage" {
  source = "../../modules/storage"

  name_prefix         = var.name_prefix
  environment         = var.environment
  location            = var.location
  resource_group_name = module.networking.resource_group_name
  tags                = local.tags
  random_suffix       = random_string.suffix.result
  account_tier        = "Standard"
  replication_type    = var.environment == "prod" ? "GRS" : "LRS"
  account_kind        = "StorageV2"
}

module "messaging" {
  source = "../../modules/messaging/azure-service-bus"

  name_prefix         = var.name_prefix
  environment         = var.environment
  location            = var.location
  resource_group_name = module.networking.resource_group_name
  tags                = local.tags
  sku                 = var.environment == "prod" ? "Premium" : "Standard"
  capacity            = var.environment == "prod" ? 1 : 0
}

module "front_door" {
  source = "../../modules/front-door"

  name_prefix         = var.name_prefix
  environment         = var.environment
  resource_group_name = module.networking.resource_group_name
  tags                = local.tags
  ingress_hostname    = module.aks.kubelet_identity[0].client_id
  origin_host_header  = "app.threatcheck.ai"
}

module "entra_id" {
  source = "../../modules/entra-id"

  name_prefix   = var.name_prefix
  environment   = var.environment
  redirect_uris = ["https://app.threatcheck.ai/auth/callback"]
}

resource "azurerm_kubernetes_cluster" "this" {
  name                = "${var.name_prefix}-aks-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = "${var.name_prefix}-${var.environment}"
  kubernetes_version  = var.kubernetes_version
  sku_tier            = var.sku_tier

  default_node_pool {
    name                = "system"
    vm_size             = var.system_pool.vm_size
    zones              = var.system_pool.zones
    enable_auto_scaling = true
    min_count           = var.system_pool.min_count
    max_count           = var.system_pool.max_count
    os_disk_size_gb    = var.system_pool.os_disk_size_gb
    vnet_subnet_id     = var.aks_subnet_id
    node_labels = {
      "threatcheck.io/node-pool" = "system"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    network_policy    = "calico"
    load_balancer_sku = "standard"
  }

  oms_agent {
    log_analytics_workspace_id = var.log_analytics_workspace_id
  }

  key_vault_secrets_provider {
    secret_rotation_enabled = true
  }

  azure_active_directory_role_based_access_control {
    managed            = true
    azure_rbac_enabled = true
  }

  tags = var.tags
}

resource "azurerm_kubernetes_cluster_node_pool" "scan" {
  name                  = "scanspot"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.this.id
  vm_size               = var.scan_pool.vm_size
  zones                 = var.scan_pool.zones
  enable_auto_scaling   = true
  min_count             = var.scan_pool.min_count
  max_count             = var.scan_pool.max_count
  os_disk_size_gb       = var.scan_pool.os_disk_size_gb
  vnet_subnet_id        = var.aks_subnet_id
  priority              = "Spot"
  eviction_policy       = "Delete"
  spot_max_price        = -1
  node_labels = {
    "threatcheck.io/node-pool" = "scan"
    "threatcheck.io/workload"  = "ephemeral"
  }
  node_taints = [
    "threatcheck.io/scan=true:NoSchedule"
  ]
  tags = var.tags
}

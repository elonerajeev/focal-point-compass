resource "azurerm_cdn_frontdoor_profile" "this" {
  name                = "${var.name_prefix}-afd-${var.environment}"
  resource_group_name = var.resource_group_name
  sku_name            = "Standard_AzureFrontDoor"
  tags                = var.tags
}

resource "azurerm_cdn_frontdoor_endpoint" "this" {
  name                     = "${var.name_prefix}-afd-ep-${var.environment}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.this.id
  tags                     = var.tags
}

resource "azurerm_cdn_frontdoor_origin_group" "aks" {
  name                     = "${var.name_prefix}-afd-og-${var.environment}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.this.id

  health_probe {
    interval_in_seconds = 30
    path                = "/api/health"
    protocol            = "Https"
    request_type        = "HEAD"
  }

  session_affinity_enabled = false
}

resource "azurerm_cdn_frontdoor_origin" "aks" {
  name                          = "aks-ingress"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.aks.id
  enabled                        = true
  host_name                     = var.ingress_hostname
  http_port                      = 80
  https_port                     = 443
  origin_host_header            = var.origin_host_header
  priority                      = 1
  weight                        = 100
}

resource "azurerm_cdn_frontdoor_route" "api" {
  name                          = "api-route"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.this.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.aks.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.aks.id]
  patterns_matching_directories = ["/*"]
  supported_protocols           = ["Http", "Https"]
  forwarding_protocol           = "HttpsOnly"
  link_to_default_domain        = true
  https_redirect_enabled        = true
}

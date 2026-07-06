resource "azurerm_servicebus_namespace" "this" {
  name                = "${var.name_prefix}-sb-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = var.sku
  capacity            = var.capacity
  tags                = var.tags
}

resource "azurerm_servicebus_queue" "scan_requests" {
  name         = "scan-requests"
  namespace_id = azurerm_servicebus_namespace.this.id

  enable_partitioning                      = true
  lock_duration                            = "PT30S"
  max_size_in_megabytes                    = 1024
  max_delivery_count                       = 5
  dead_lettering_on_message_expiration     = true
  default_message_ttl                      = "PT24H"
  duplicate_detection_history_time_window  = "PT10M"
}

resource "azurerm_servicebus_queue" "scan_completions" {
  name         = "scan-completions"
  namespace_id = azurerm_servicebus_namespace.this.id

  enable_partitioning                      = true
  lock_duration                            = "PT30S"
  max_size_in_megabytes                    = 1024
  max_delivery_count                       = 3
  default_message_ttl                      = "PT72H"
}

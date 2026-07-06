output "namespace_id" {
  value = azurerm_servicebus_namespace.this.id
}

output "namespace_name" {
  value = azurerm_servicebus_namespace.this.name
}

output "connection_string" {
  value     = azurerm_servicebus_namespace.this.default_primary_connection_string
  sensitive = true
}

output "scan_requests_queue" {
  value = azurerm_servicebus_queue.scan_requests.name
}

output "scan_completions_queue" {
  value = azurerm_servicebus_queue.scan_completions.name
}

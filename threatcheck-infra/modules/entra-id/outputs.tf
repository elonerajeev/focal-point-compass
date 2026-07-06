output "client_id" {
  value = azuread_application.threatcheck.client_id
}

output "client_secret" {
  value     = try(azuread_application_password.this.value, "")
  sensitive = true
}

output "object_id" {
  value = azuread_service_principal.threatcheck.object_id
}

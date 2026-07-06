data "azurerm_client_config" "current" {}

resource "azuread_application" "threatcheck" {
  display_name = "${var.name_prefix}-app-${var.environment}"

  web {
    redirect_uris = var.redirect_uris

    implicit_grant {
      access_token_issuance_enabled = true
      id_token_issuance_enabled     = true
    }
  }

  required_resource_access {
    resource_app_id = "00000003-0000-0000-c000-000000000000"

    resource_access {
      id   = "e1fe6dd8-ba31-4d61-89e7-88639da4923d"
      type = "Scope"
    }

    resource_access {
      id   = "37f7f235-527c-4136-accd-4a02d197296e"
      type = "Scope"
    }
  }

  group_membership_claims = ["All"]
  owners                 = [data.azurerm_client_config.current.object_id]
}

resource "azuread_service_principal" "threatcheck" {
  client_id = azuread_application.threatcheck.client_id
  owners    = [data.azurerm_client_config.current.object_id]
}

output "resource_group" {
  value = module.networking.resource_group_name
}

output "aks_cluster_name" {
  value = module.aks.cluster_name
}

output "acr_login_server" {
  value = module.acr.login_server
}

output "key_vault_uri" {
  value = module.key_vault.vault_uri
}

output "postgres_fqdn" {
  value = module.postgres.fqdn
}

output "redis_hostname" {
  value = module.redis.hostname
}

output "storage_account" {
  value = module.storage.storage_account_name
}

output "service_bus_namespace" {
  value = module.messaging.namespace_name
}

output "scan_queue_name" {
  value = module.messaging.scan_requests_queue
}

output "completion_queue_name" {
  value = module.messaging.scan_completions_queue
}

output "connect_aks" {
  value = "az aks get-credentials --resource-group ${module.networking.resource_group_name} --name ${module.aks.cluster_name}"
}

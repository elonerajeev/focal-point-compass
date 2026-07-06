output "cluster_id" {
  value = azurerm_kubernetes_cluster.this.id
}

output "cluster_name" {
  value = azurerm_kubernetes_cluster.this.name
}

output "kubelet_identity" {
  value = azurerm_kubernetes_cluster.this.kubelet_identity
}

output "oidc_issuer_url" {
  value = azurerm_kubernetes_cluster.this.oidc_issuer_url
}

output "kube_config_raw" {
  value     = azurerm_kubernetes_cluster.this.kube_config_raw
  sensitive = true
}

output "scan_pool_name" {
  value = azurerm_kubernetes_cluster_node_pool.scan.name
}

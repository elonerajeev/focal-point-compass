{{- define "flowsyc-namespace-provisioner.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "flowsyc-namespace-provisioner.fullname" -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "flowsyc-namespace-provisioner.labels" -}}
app.kubernetes.io/name: {{ include "flowsyc-namespace-provisioner.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/component: namespace-provisioner
app.kubernetes.io/part-of: flowsyc
{{- end -}}

REGISTRY ?= flowsyc
TAG ?= latest
PLATFORM ?= linux/amd64

.PHONY: all build push kind-load clean

all: build

# ── Build Images ──────────────────────────────────

build: build-backend build-frontend build-worker

build-backend:
	docker build -f docker/backend.Dockerfile \
		-t $(REGISTRY)/backend:$(TAG) \
		--platform $(PLATFORM) .

build-frontend:
	docker build -f docker/frontend.Dockerfile \
		-t $(REGISTRY)/frontend:$(TAG) \
		--platform $(PLATFORM) .

build-worker:
	docker build -f docker/worker.Dockerfile \
		-t $(REGISTRY)/worker:$(TAG) \
		--platform $(PLATFORM) .

# ── Push Images ───────────────────────────────────

push: push-backend push-frontend push-worker

push-backend:
	docker push $(REGISTRY)/backend:$(TAG)

push-frontend:
	docker push $(REGISTRY)/frontend:$(TAG)

push-worker:
	docker push $(REGISTRY)/worker:$(TAG)

# ── Load into KIND ───────────────────────────────

kind-load: kind-load-backend kind-load-frontend kind-load-worker

kind-load-backend:
	kind load docker-image $(REGISTRY)/backend:$(TAG)

kind-load-frontend:
	kind load docker-image $(REGISTRY)/frontend:$(TAG)

kind-load-worker:
	kind load docker-image $(REGISTRY)/worker:$(TAG)

# ── Helm ──────────────────────────────────────────

helm-deps:
	cd helm/flowsyc-umbrella && helm dependency update

helm-install:
	helm install flowsyc ./helm/flowsyc-umbrella \
		--namespace flowsyc --create-namespace

helm-upgrade:
	helm upgrade flowsyc ./helm/flowsyc-umbrella \
		--namespace flowsyc --create-namespace \
		--set global.imageTag=$(TAG)

helm-uninstall:
	helm uninstall flowsyc --namespace flowsyc

helm-template:
	helm template flowsyc ./helm/flowsyc-umbrella \
		--namespace flowsyc --debug

# ── Tenant Namespace (per-customer) ────────────────

helm-install-tenant:
	helm install tenant-$(ORG_ID) ./helm/charts/flowsyc-tenant-namespace \
		--namespace tenant-$(ORG_ID) --create-namespace \
		--set orgId=$(ORG_ID) \
		--set tenantName="$(TENANT_NAME)" \
		--set plan=$(PLAN)

helm-upgrade-tenant:
	helm upgrade tenant-$(ORG_ID) ./helm/charts/flowsyc-tenant-namespace \
		--namespace tenant-$(ORG_ID) \
		--set orgId=$(ORG_ID) \
		--set tenantName="$(TENANT_NAME)" \
		--set plan=$(PLAN)

helm-delete-tenant:
	helm uninstall tenant-$(ORG_ID) --namespace tenant-$(ORG_ID)
	kubectl delete namespace tenant-$(ORG_ID)

# ── Release Tagging ──────────────────────────────

tag:
	@read -p "Enter version (e.g. 0.1.0): " V; \
	docker tag $(REGISTRY)/backend:latest $(REGISTRY)/backend:v$$V; \
	docker tag $(REGISTRY)/frontend:latest $(REGISTRY)/frontend:v$$V; \
	docker tag $(REGISTRY)/worker:latest $(REGISTRY)/worker:v$$V; \
	echo "Tagged v$$V"

tag-push: tag
	docker push $(REGISTRY)/backend:latest; \
	docker push $(REGISTRY)/frontend:latest; \
	docker push $(REGISTRY)/worker:latest

# ── Clean ─────────────────────────────────────────

clean:
	docker rmi $(REGISTRY)/backend:$(TAG) 2>/dev/null || true
	docker rmi $(REGISTRY)/frontend:$(TAG) 2>/dev/null || true
	docker rmi $(REGISTRY)/worker:$(TAG) 2>/dev/null || true

# ── Help ──────────────────────────────────────────

help:
	@echo "Usage:"
	@echo "  make build           Build all images"
	@echo "  make push            Push all images to registry"
	@echo "  make kind-load       Load images into KIND cluster"
	@echo "  make helm-install    Install umbrella chart"
	@echo "  make helm-upgrade    Upgrade umbrella chart"
	@echo "  make ORG_ID=xxx PLAN=free helm-install-tenant   Create tenant namespace"
	@echo ""
	@echo "Variables:"
	@echo "  REGISTRY=$(REGISTRY)   TAG=$(TAG)   PLATFORM=$(PLATFORM)"

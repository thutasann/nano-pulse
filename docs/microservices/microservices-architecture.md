# Microservices Architecture

                                  ┌───────────────────────┐
                                  │     API Gateway       │
                                  │ (Spring Cloud Gateway) │
                                  └───────────▲───────────┘
                                             │
                 ┌───────────────────────────┼───────────────────────────┐
                 │                           │                           │
    ┌────────────▼─────────────┐  ┌──────────▼─────────────┐  ┌─────────▼──────────────┐
    │  Authentication Service  │  │    Webhook API         │  │  Workflow Designer     │
    │     (Spring Boot)        │  │     (Express)          │  │     (Spring Boot)      │
    │ - User Management        │  │ - Register Webhook     │  │ - Workflow Templates   │
    │ - OAuth2/OIDC            │  │ - Event Processing     │  │ - Workflow Versioning  │
    │ - RBAC                   │  │ - Webhook Management   │  │ - Validation Rules     │
    └────────────▲─────────────┘  └──────────▲─────────────┘  └─────────▲──────────────┘
                 │                            │                          │
                 │                            │                          │
    ┌────────────▼─────────────┐  ┌──────────▼─────────────┐  ┌─────────▼──────────────┐
    │   Integration Hub        │  │      Event Bus         │  │   Analytics Service    │
    │     (Spring Boot)        │  │  (Kafka & Redis)       │  │     (Spring Boot)      │
    │ - 3rd Party Connectors   │  │ - Message Queuing      │  │ - Usage Metrics        │
    │ - API Management         │  │ - Event Streaming      │  │ - Performance Data     │
    │ - Credential Storage     │  │ - Pub/Sub              │  │ - Reporting            │
    └────────────▲─────────────┘  └──────────▲─────────────┘  └─────────▲──────────────┘
                 │                            │                          │
                 └────────────────┬───────────┴──────────────┬──────────┘
                                  │                          │
                    ┌─────────────▼──────────┐   ┌───────────▼─────────────┐
                    │  Workflow Executor     │   │  Real-time Service      │
                    │     (Node.js)          │   │     (Node.js)           │
                    │ - Execute Workflows    │   │ - WebSocket Server      │
                    │ - Process Events       │   │ - Real-time Updates     │
                    │ - Handle Retries       │   │ - Client Notifications  │
                    └─────────────▲──────────┘   └───────────▲─────────────┘
                                  │                          │
                    ┌─────────────▼──────────────────────────▼─────────────┐
                    │                   Data Layer                         │
                    │  - MongoDB (Document Store)                          │
                    │  - Redis (Cache & Pub/Sub)                           │
                    │  - Kafka (Event Streaming)                           │
                    └─────────────▲──────────────────────────▲─────────────┘
                                  │                          │
                    ┌─────────────▼──────────┐   ┌───────────▼─────────────┐
                    │  Monitoring & Alerts   │   │  Infrastructure         │
                    │ - Prometheus/Grafana   │   │ - Kubernetes            │
                    │ - ELK Stack            │   │ - Service Mesh (Istio)  │
                    │ - Alerting             │   │ - CI/CD Pipeline        │
                    └──────────────────────────┘   └─────────────────────────┘

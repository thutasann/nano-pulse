# Microservices Architecture

This is the Overall Microservices Architecture

                           ┌──────────────────┐
                           │   API Gateway    │
                           │(Rate Limit, Auth)│
                           └────────▲─────────┘
                                    │
     ┌───────────────┐    ┌────────▼─────────┐    ┌──────────────────┐
     │ Spring Boot   │    │   Node.js        │    │   Spring Boot    │
     │ Security      │◄───┤   Webhook API    ├───►│   Analytics      │
     │ Service       │    │   (Express)      │    │   Service        │
     └───────▲───────┘    └────────▲─────────┘    └──────▲───────────┘
             │                      │                      │
             │             ┌────────▼─────────┐           │
             │             │    Event Bus     │           │
             │             │  Redis & Kafka   │           │
             │             └────────▲─────────┘           │
             │                      │                      │
     ┌───────▼───────┐    ┌────────▼─────────┐    ┌──────▼───────────┐
     │  Spring Boot  │    │   Node.js        │    │    MongoDB       │
     │  Delivery     │◄───┤   Workers        ├───►│    Redis         │
     │  Service      │    │                  │    │    Storage       │
     └───────────────┘    └────────▲─────────┘    └──────────────────┘
                                   │
                         ┌────────▼─────────┐
                         │  Monitoring      │
                         │  (Prometheus/    │
                         │   Grafana)       │
                         └──────────────────┘

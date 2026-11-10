# System Architecture

## Overview

The Property Rental and Tenant Management Platform follows a modern three-tier architecture with containerized deployment support. This document describes the system's architecture, components, and their interactions.

---

## High-Level Architecture

```mermaid
graph LR
    subgraph Clients
        WEB[Web Browser]
        MOB[Mobile Browser]
    end

    subgraph "Frontend Tier"
        NGINX[Nginx :80]
        REACT[React SPA]
    end

    subgraph "Backend Tier"
        EXPRESS[Express.js :5000]
        AUTH[Auth Middleware]
        ROUTES[API Routes]
        CTRL[Controllers]
    end

    subgraph "Data Tier"
        MONGO[(MongoDB :27017)]
        VOL[Persistent Volume]
    end

    WEB --> NGINX
    MOB --> NGINX
    NGINX --> REACT
    REACT -->|REST API| EXPRESS
    EXPRESS --> AUTH --> ROUTES --> CTRL --> MONGO
    MONGO --> VOL
```

---

## Component Diagram

```mermaid
graph TB
    subgraph Frontend["Frontend Application"]
        APP[App.jsx]
        PAGES[Pages Layer]
        COMPONENTS[Component Library]
        CONTEXT[Context Providers]
        SERVICES[API Service Layer]
        UTILS[Utilities]

        APP --> PAGES
        APP --> CONTEXT
        PAGES --> COMPONENTS
        PAGES --> SERVICES
        CONTEXT --> SERVICES
        SERVICES --> UTILS
    end

    subgraph Backend["Backend Application"]
        SERVER[server.js]
        ROUTER[Route Definitions]
        MIDDLEWARE[Middleware Stack]
        CONTROLLERS[Controller Logic]
        MODELS[Mongoose Models]
        CONFIG[Configuration]
        SEEDS[Seed Scripts]

        SERVER --> CONFIG
        SERVER --> ROUTER
        ROUTER --> MIDDLEWARE
        MIDDLEWARE --> CONTROLLERS
        CONTROLLERS --> MODELS
        SEEDS --> MODELS
    end

    subgraph Database["Database"]
        MONGODB[(MongoDB)]
        COLLECTIONS[Collections]

        MONGODB --> COLLECTIONS
    end

    SERVICES -->|HTTP Requests| SERVER
    MODELS -->|Mongoose ODM| MONGODB
```

---

## Deployment Diagram

### Docker Compose Deployment

```mermaid
graph TB
    subgraph DockerHost["Docker Host"]
        subgraph Network["rental-network (bridge)"]
            FE["rental-frontend<br/>Nginx + React<br/>Port: 80"]
            BE["rental-backend<br/>Node.js + Express<br/>Port: 5000"]
            DB["rental-mongodb<br/>MongoDB 7<br/>Port: 27017"]
        end
        VOL["mongodb_data<br/>(Docker Volume)"]
    end

    USER[User Browser] -->|:80| FE
    FE -->|:5000| BE
    BE -->|:27017| DB
    DB --> VOL
```

### Kubernetes Deployment

```mermaid
graph TB
    subgraph K8sCluster["Kubernetes Cluster"]
        subgraph NS["Namespace: rental-platform"]
            ING[Ingress Controller<br/>rental.local]

            subgraph FrontendPods["Frontend Pods (x2)"]
                FE1[frontend-pod-1]
                FE2[frontend-pod-2]
            end
            FE_SVC[frontend-service<br/>NodePort :80]

            subgraph BackendPods["Backend Pods (x2)"]
                BE1[backend-pod-1]
                BE2[backend-pod-2]
            end
            BE_SVC[backend-service<br/>ClusterIP :5000]

            subgraph MongoDBPod["MongoDB Pod (x1)"]
                DBPOD[mongodb-pod]
            end
            DB_SVC[mongodb-service<br/>ClusterIP :27017]

            CM[ConfigMap<br/>rental-config]
            SEC[Secret<br/>rental-secrets]
            PVC[PVC<br/>mongodb-pvc 1Gi]
        end
    end

    USER[User] -->|rental.local| ING
    ING -->|/| FE_SVC --> FE1 & FE2
    ING -->|/api| BE_SVC --> BE1 & BE2
    BE1 & BE2 --> DB_SVC --> DBPOD
    DBPOD --> PVC
    CM -.->|env| BE1 & BE2
    SEC -.->|env| BE1 & BE2 & DBPOD
```

---

## Data Flow Diagrams

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB

    U->>F: Enter credentials
    F->>B: POST /api/auth/login
    B->>DB: Find user by email
    DB-->>B: User document
    B->>B: Verify password (bcrypt)
    B->>B: Generate JWT token
    B-->>F: { token, user }
    F->>F: Store token in localStorage
    F-->>U: Redirect to dashboard
```

### Maintenance Request Flow

```mermaid
sequenceDiagram
    participant T as Tenant
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant M as Manager

    T->>F: Submit maintenance request
    F->>B: POST /api/maintenance
    B->>DB: Create maintenance document
    DB-->>B: Saved document
    B-->>F: 201 Created
    F-->>T: Success notification

    M->>F: View pending requests
    F->>B: GET /api/maintenance
    B->>DB: Query maintenance docs
    DB-->>B: Maintenance list
    B-->>F: JSON response
    F-->>M: Display requests

    M->>F: Update status to "In Progress"
    F->>B: PUT /api/maintenance/:id
    B->>DB: Update document
    DB-->>B: Updated doc
    B-->>F: 200 OK
```

### Payment Flow

```mermaid
sequenceDiagram
    participant T as Tenant
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB

    T->>F: View payment due
    F->>B: GET /api/payments?tenant=id
    B->>DB: Query payments
    DB-->>B: Payment records
    B-->>F: Payment list
    F-->>T: Display amounts due

    T->>F: Make payment
    F->>B: POST /api/payments
    B->>DB: Create payment record
    B->>DB: Update lease payment status
    DB-->>B: Confirmation
    B-->>F: 201 Created
    F-->>T: Payment confirmation
```

---

## Technology Stack Details

### Frontend Stack

| Technology | Purpose | Details |
|-----------|---------|---------|
| **React 18** | UI Library | Component-based architecture with hooks |
| **Vite** | Build Tool | Fast HMR, optimized production builds |
| **Material UI 5** | Component Library | Pre-built accessible UI components |
| **React Router v6** | Routing | Client-side routing with protected routes |
| **Axios** | HTTP Client | Promise-based API communication |
| **Context API** | State Management | Global state for auth and app data |

### Backend Stack

| Technology | Purpose | Details |
|-----------|---------|---------|
| **Node.js 18** | Runtime | JavaScript server-side execution |
| **Express.js 4** | Framework | Minimalist web framework for APIs |
| **Mongoose 7** | ODM | MongoDB object modeling and validation |
| **JWT** | Authentication | Stateless token-based auth |
| **bcryptjs** | Security | Password hashing |
| **cors** | Security | Cross-origin resource sharing |
| **dotenv** | Configuration | Environment variable management |

### Infrastructure Stack

| Technology | Purpose | Details |
|-----------|---------|---------|
| **Docker** | Containerization | Application packaging |
| **Docker Compose** | Orchestration | Multi-container local deployment |
| **Kubernetes** | Orchestration | Production container management |
| **Nginx** | Web Server | Static file serving & reverse proxy |
| **MongoDB 7** | Database | NoSQL document database |

---

## Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Stateless authentication with configurable expiration
- **Password Hashing**: bcrypt with salt rounds for secure storage
- **Role-Based Access Control**: Four roles with distinct permissions
- **Protected Routes**: Middleware-based route protection on both frontend and backend

### Role Permissions Matrix

| Resource | Admin | Owner | Manager | Tenant |
|----------|-------|-------|---------|--------|
| View all users | ✅ | ❌ | ❌ | ❌ |
| Manage properties | ✅ | ✅ (own) | ✅ (assigned) | ❌ |
| Manage tenants | ✅ | ✅ (own) | ✅ (assigned) | ❌ |
| Manage leases | ✅ | ✅ (own) | ✅ (assigned) | 👁️ (own) |
| Maintenance requests | ✅ | ✅ | ✅ | ✅ (own) |
| Payments | ✅ | ✅ | ✅ | ✅ (own) |
| View dashboard | ✅ | ✅ | ✅ | ✅ |

---

## Scalability Considerations

- **Horizontal Scaling**: Backend pods can be scaled independently via Kubernetes replicas
- **Database**: MongoDB supports replica sets for high availability (not included in this MVP)
- **Stateless Backend**: JWT-based auth enables easy horizontal scaling
- **CDN-Ready Frontend**: Static assets served via Nginx can be cached at CDN layer
- **Persistent Storage**: MongoDB data persisted via Docker volumes or Kubernetes PVCs

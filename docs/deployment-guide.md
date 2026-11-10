# Deployment Guide

## Overview

This guide covers three deployment methods for the Property Rental and Tenant Management Platform:

1. **Local Development** — Direct Node.js and MongoDB setup
2. **Docker Deployment** — Containerized deployment with Docker Compose
3. **Kubernetes Deployment** — Production-grade orchestration with Kubernetes

---

## 1. Local Development Setup

### Prerequisites

- Node.js 18+ and npm 9+
- MongoDB 7+ (running locally or connection string to remote instance)
- Git

### Steps

#### 1.1 Clone the Repository

```bash
git clone <repository-url>
cd PROJECT_DEVOPS
```

#### 1.2 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your local settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/property_rental
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRE=7d
NODE_ENV=development
VITE_API_URL=http://localhost:5000
```

#### 1.3 Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 1.4 Start MongoDB

```bash
# If using local MongoDB
mongod --dbpath /data/db

# Or if using MongoDB as a service
sudo systemctl start mongod
```

#### 1.5 Seed the Database (Optional)

```bash
cd backend
node seeds/seed.js
```

This creates demo users (admin, owner, tenant, manager) and sample data.

#### 1.6 Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### 1.7 Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |

---

## 2. Docker Deployment

### Prerequisites

- Docker 24+
- Docker Compose 2.20+

### Steps

#### 2.1 Build and Start All Services

```bash
# Build images and start containers
docker-compose up --build -d
```

This starts three containers:
- `rental-mongodb` — MongoDB 7 database
- `rental-backend` — Node.js API server
- `rental-frontend` — Nginx serving React app

#### 2.2 Verify Services Are Running

```bash
docker-compose ps
```

Expected output:
```
NAME              STATUS         PORTS
rental-mongodb    Up (healthy)   0.0.0.0:27017->27017/tcp
rental-backend    Up             0.0.0.0:5000->5000/tcp
rental-frontend   Up             0.0.0.0:80->80/tcp
```

#### 2.3 Seed the Database

```bash
docker exec -it rental-backend node seeds/seed.js
```

#### 2.4 Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:5000 |

#### 2.5 View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mongodb
docker-compose logs -f frontend
```

#### 2.6 Stop Services

```bash
# Stop containers (preserve data)
docker-compose down

# Stop containers and remove volumes (destroys data)
docker-compose down -v
```

#### 2.7 Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Or rebuild everything
docker-compose up --build -d
```

---

## 3. Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (Minikube, kind, or cloud provider)
- kubectl 1.28+
- Docker (for building images)

### 3.1 Minikube Setup

#### Start Minikube

```bash
minikube start --driver=docker --memory=4096 --cpus=2
```

#### Enable Ingress Addon

```bash
minikube addons enable ingress
```

#### Configure Docker Environment

Point your Docker CLI to the Minikube Docker daemon so images are available inside the cluster:

```bash
# Linux/macOS
eval $(minikube docker-env)

# Windows PowerShell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

### 3.2 Build Docker Images

Build the images inside the Minikube Docker environment:

```bash
docker build -t property-rental-backend:latest ./backend
docker build -t property-rental-frontend:latest ./frontend
```

### 3.3 Deploy to Kubernetes

Apply the manifests in order:

```bash
# Step 1: Create the namespace
kubectl apply -f k8s/namespace.yaml

# Step 2: Apply configuration
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.example.yaml

# Step 3: Deploy MongoDB
kubectl apply -f k8s/mongodb-pvc.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/mongodb-service.yaml

# Step 4: Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n rental-platform --timeout=120s

# Step 5: Deploy Backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Step 6: Wait for Backend to be ready
kubectl wait --for=condition=ready pod -l app=backend -n rental-platform --timeout=120s

# Step 7: Deploy Frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Step 8: Apply Ingress
kubectl apply -f k8s/ingress.yaml
```

Or apply all at once:

```bash
kubectl apply -f k8s/
```

### 3.4 Verify Deployment

```bash
# Check all resources
kubectl get all -n rental-platform

# Check pods are running
kubectl get pods -n rental-platform

# Check services
kubectl get svc -n rental-platform

# Check ingress
kubectl get ingress -n rental-platform
```

Expected output:
```
NAME                            READY   STATUS    RESTARTS   AGE
pod/mongodb-xxx                 1/1     Running   0          5m
pod/backend-xxx                 1/1     Running   0          3m
pod/backend-yyy                 1/1     Running   0          3m
pod/frontend-xxx                1/1     Running   0          2m
pod/frontend-yyy                1/1     Running   0          2m

NAME                       TYPE        CLUSTER-IP       PORT(S)
service/mongodb-service    ClusterIP   10.96.x.x        27017/TCP
service/backend-service    ClusterIP   10.96.x.x        5000/TCP
service/frontend-service   NodePort    10.96.x.x        80:3xxxx/TCP
```

### 3.5 Access the Application

#### Option A: Using Minikube Service

```bash
minikube service frontend-service -n rental-platform
```

#### Option B: Using Port Forwarding

```bash
# Frontend
kubectl port-forward svc/frontend-service 8080:80 -n rental-platform

# Backend API
kubectl port-forward svc/backend-service 5000:5000 -n rental-platform
```

#### Option C: Using Ingress

Add the following to your hosts file:

```
# Linux/macOS: /etc/hosts
# Windows: C:\Windows\System32\drivers\etc\hosts
<minikube-ip> rental.local
```

Get Minikube IP:
```bash
minikube ip
```

Access at `http://rental.local`

### 3.6 Seed the Database in Kubernetes

```bash
# Get the backend pod name
kubectl get pods -n rental-platform -l app=backend

# Execute seed script
kubectl exec -it <backend-pod-name> -n rental-platform -- node seeds/seed.js
```

### 3.7 View Logs

```bash
# MongoDB logs
kubectl logs -f deployment/mongodb -n rental-platform

# Backend logs
kubectl logs -f deployment/backend -n rental-platform

# Frontend logs
kubectl logs -f deployment/frontend -n rental-platform
```

### 3.8 Scaling

```bash
# Scale backend to 3 replicas
kubectl scale deployment backend --replicas=3 -n rental-platform

# Scale frontend to 3 replicas
kubectl scale deployment frontend --replicas=3 -n rental-platform
```

### 3.9 Clean Up

```bash
# Delete all resources in the namespace
kubectl delete -f k8s/

# Or delete the entire namespace
kubectl delete namespace rental-platform
```

---

## Troubleshooting

### Docker Issues

| Problem | Solution |
|---------|----------|
| Port already in use | Change port mapping in `docker-compose.yml` or stop conflicting service |
| MongoDB won't start | Check if port 27017 is already in use: `lsof -i :27017` |
| Backend can't connect to MongoDB | Ensure MongoDB container is healthy: `docker-compose ps` |
| Frontend shows blank page | Check browser console for API URL errors; verify `VITE_API_URL` |
| Permission denied on volume | Run `docker-compose down -v` and rebuild |

### Kubernetes Issues

| Problem | Solution |
|---------|----------|
| Pod in CrashLoopBackOff | Check logs: `kubectl logs <pod> -n rental-platform` |
| ImagePullBackOff | Ensure images are built in Minikube Docker env |
| MongoDB PVC pending | Check storage class: `kubectl get sc` |
| Ingress not working | Verify ingress controller: `minikube addons enable ingress` |
| Backend can't reach MongoDB | Check service DNS: `kubectl exec -it <pod> -- nslookup mongodb-service` |
| Connection refused | Verify service selectors match pod labels |

### Common Debugging Commands

```bash
# Describe a pod for events and errors
kubectl describe pod <pod-name> -n rental-platform

# Get container logs (including previous crashed containers)
kubectl logs <pod-name> -n rental-platform --previous

# Execute a shell in a running container
kubectl exec -it <pod-name> -n rental-platform -- sh

# Check endpoint connectivity
kubectl get endpoints -n rental-platform

# View resource utilization
kubectl top pods -n rental-platform
```

---

## Production Considerations

- **Secrets Management**: Replace `secret.example.yaml` with actual secrets using a secrets manager (Vault, AWS Secrets Manager, etc.)
- **TLS/SSL**: Configure TLS certificates on the Ingress for HTTPS
- **MongoDB Replica Set**: Use a MongoDB replica set or managed service (Atlas, DocumentDB) for production
- **Persistent Storage**: Use cloud-provider storage classes for PVCs
- **Monitoring**: Add Prometheus and Grafana for metrics and alerting
- **Logging**: Implement centralized logging with ELK/EFK stack
- **CI/CD**: Set up automated build and deployment pipelines
- **Resource Limits**: Tune CPU and memory limits based on actual usage
- **Network Policies**: Implement Kubernetes network policies to restrict inter-pod communication
- **Backups**: Configure automated MongoDB backups

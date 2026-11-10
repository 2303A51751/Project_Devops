@echo off
echo ========================================================
echo   Deploying Property Rental Platform to Kubernetes
echo ========================================================
echo.

where kubectl >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] kubectl CLI was not found in your system PATH.
    echo Please install kubectl and ensure a cluster (Minikube, Kind, Docker Desktop) is active.
    pause
    exit /b 1
)

echo 1. Creating Namespace...
kubectl apply -f k8s/namespace.yaml

echo 2. Applying ConfigMap and Secrets...
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

echo 3. Setting up Persistent Storage...
kubectl apply -f k8s/mongodb-pvc.yaml

echo 4. Deploying MongoDB Cluster...
kubectl apply -f k8s/mongodb-service.yaml
kubectl apply -f k8s/mongodb-deployment.yaml

echo 5. Deploying Backend Microservice...
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-deployment.yaml

echo 6. Deploying Frontend Web Application...
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml

echo 7. Configuring Ingress and Horizontal Pod Autoscalers...
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

echo.
echo Waiting for deployments to become ready...
kubectl rollout status deployment/mongodb -n rental-platform --timeout=120s
kubectl rollout status deployment/backend -n rental-platform --timeout=120s
kubectl rollout status deployment/frontend -n rental-platform --timeout=120s

echo.
echo ========================================================
echo   Deployment Complete!
echo ========================================================
echo View pods:     kubectl get pods -n rental-platform
echo View services: kubectl get svc -n rental-platform
echo.
echo Access Frontend at NodePort: http://localhost:30080
echo.
pause

@echo off
echo Deleting Property Rental Kubernetes Resources...
kubectl delete namespace rental-platform
echo All Kubernetes resources in namespace rental-platform deleted.
pause

# Testing Guide

## Overview

This document outlines the testing strategy, test cases, and procedures for the Property Rental and Tenant Management Platform. Testing covers backend API endpoints, frontend components, and integration scenarios.

---

## Test Strategy

### Testing Levels

| Level | Scope | Tools |
|-------|-------|-------|
| **Unit Tests** | Individual functions, models, utilities | Jest, React Testing Library |
| **Integration Tests** | API endpoints, database operations | Jest, Supertest |
| **Component Tests** | React components in isolation | React Testing Library, Jest |
| **End-to-End Tests** | Full user workflows | Cypress (optional) |
| **Manual Tests** | UI/UX validation, exploratory testing | Browser |

### Test Environment

- **Database**: Separate test database (`property_rental_test`)
- **Environment**: `NODE_ENV=test`
- **Seeding**: Fresh seed data before each test suite

---

## How to Run Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern=auth

# Run specific test suite
npm test -- --testNamePattern="POST /api/auth/login"
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage

# Run specific component tests
npm test -- --testPathPattern=Login
```

### Coverage Requirements

| Metric | Target |
|--------|--------|
| Statements | ≥ 80% |
| Branches | ≥ 75% |
| Functions | ≥ 80% |
| Lines | ≥ 80% |

---

## Test Cases by Module

### 1. Authentication Module

#### 1.1 User Registration

| # | Test Case | Input | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| TC-AUTH-001 | Register with valid data | Valid name, email, password, role | 201 Created, returns token and user | ✅ |
| TC-AUTH-002 | Register with existing email | Duplicate email | 400 Bad Request, "Email already exists" | ✅ |
| TC-AUTH-003 | Register with missing name | No name field | 400 Bad Request, validation error | ✅ |
| TC-AUTH-004 | Register with invalid email | "not-an-email" | 400 Bad Request, validation error | ✅ |
| TC-AUTH-005 | Register with short password | Password < 6 chars | 400 Bad Request, validation error | ✅ |
| TC-AUTH-006 | Register with invalid role | role = "superuser" | 400 Bad Request, invalid role | ✅ |
| TC-AUTH-007 | Register without role | No role field | 400 Bad Request, role required | ✅ |

#### 1.2 User Login

| # | Test Case | Input | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| TC-AUTH-008 | Login with valid credentials | Correct email and password | 200 OK, returns token and user | ✅ |
| TC-AUTH-009 | Login with wrong password | Valid email, wrong password | 401 Unauthorized | ✅ |
| TC-AUTH-010 | Login with non-existent email | Unknown email | 401 Unauthorized | ✅ |
| TC-AUTH-011 | Login without email | No email field | 400 Bad Request | ✅ |
| TC-AUTH-012 | Login without password | No password field | 400 Bad Request | ✅ |

#### 1.3 Get Current User

| # | Test Case | Input | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| TC-AUTH-013 | Get profile with valid token | Valid JWT in header | 200 OK, returns user data | ✅ |
| TC-AUTH-014 | Get profile without token | No Authorization header | 401 Unauthorized | ✅ |
| TC-AUTH-015 | Get profile with expired token | Expired JWT | 401 Unauthorized | ✅ |
| TC-AUTH-016 | Get profile with invalid token | Malformed JWT | 401 Unauthorized | ✅ |

---

### 2. Properties Module

#### 2.1 Create Property

| # | Test Case | Input | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| TC-PROP-001 | Create with valid data (Owner) | All required fields, owner token | 201 Created | ✅ |
| TC-PROP-002 | Create with valid data (Admin) | All required fields, admin token | 201 Created | ✅ |
| TC-PROP-003 | Create as Tenant | Valid data, tenant token | 403 Forbidden | ✅ |
| TC-PROP-004 | Create without name | Missing name | 400 Bad Request | ✅ |
| TC-PROP-005 | Create without address | Missing address | 400 Bad Request | ✅ |
| TC-PROP-006 | Create with invalid type | type = "castle" | 400 Bad Request | ✅ |
| TC-PROP-007 | Create with negative rent | rentAmount = -500 | 400 Bad Request | ✅ |

#### 2.2 Get Properties

| # | Test Case | Input | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| TC-PROP-008 | List all (Admin) | Admin token | 200 OK, all properties | ✅ |
| TC-PROP-009 | List own (Owner) | Owner token | 200 OK, owner's properties | ✅ |
| TC-PROP-010 | Get by ID | Valid property ID | 200 OK, property details | ✅ |
| TC-PROP-011 | Get non-existent | Invalid ID | 404 Not Found | ✅ |
| TC-PROP-012 | Search by name | search=Sunset | 200 OK, filtered results | ✅ |
| TC-PROP-013 | Filter by type | type=apartment | 200 OK, filtered results | ✅ |

#### 2.3 Update Property

| # | Test Case | Input | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| TC-PROP-014 | Update own property (Owner) | Updated fields, owner token | 200 OK | ✅ |
| TC-PROP-015 | Update other's property | Owner updating another's | 403 Forbidden | ✅ |
| TC-PROP-016 | Update as Admin | Admin token | 200 OK | ✅ |

#### 2.4 Delete Property

| # | Test Case | Input | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| TC-PROP-017 | Delete own property | Owner token | 200 OK | ✅ |
| TC-PROP-018 | Delete as Tenant | Tenant token | 403 Forbidden | ✅ |
| TC-PROP-019 | Delete non-existent | Invalid ID | 404 Not Found | ✅ |

---

### 3. Tenants Module

| # | Test Case | Input | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| TC-TEN-001 | Add tenant (Owner) | Valid tenant data | 201 Created | ✅ |
| TC-TEN-002 | Add tenant (Admin) | Valid tenant data | 201 Created | ✅ |
| TC-TEN-003 | Add tenant as Tenant | Tenant token | 403 Forbidden | ✅ |
| TC-TEN-004 | List tenants | Owner/Admin token | 200 OK | ✅ |
| TC-TEN-005 | Get tenant by ID | Valid ID | 200 OK | ✅ |
| TC-TEN-006 | Update tenant | Updated fields | 200 OK | ✅ |
| TC-TEN-007 | Delete tenant | Owner token | 200 OK | ✅ |

---

### 4. Leases Module

| # | Test Case | Input | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| TC-LEA-001 | Create lease (Owner) | All required fields | 201 Created | ✅ |
| TC-LEA-002 | Create with invalid dates | endDate before startDate | 400 Bad Request | ✅ |
| TC-LEA-003 | List leases (Admin) | Admin token | 200 OK, all leases | ✅ |
| TC-LEA-004 | List leases (Tenant) | Tenant token | 200 OK, own leases | ✅ |
| TC-LEA-005 | Update lease status | status = "terminated" | 200 OK | ✅ |
| TC-LEA-006 | Delete lease (Admin) | Admin token | 200 OK | ✅ |
| TC-LEA-007 | Create as Tenant | Tenant token | 403 Forbidden | ✅ |

---

### 5. Maintenance Module

| # | Test Case | Input | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| TC-MNT-001 | Create request (Tenant) | Valid request data | 201 Created | ✅ |
| TC-MNT-002 | Create without title | Missing title | 400 Bad Request | ✅ |
| TC-MNT-003 | List requests (Admin) | Admin token | 200 OK, all requests | ✅ |
| TC-MNT-004 | List own requests (Tenant) | Tenant token | 200 OK, own requests | ✅ |
| TC-MNT-005 | Update status (Manager) | status = "in-progress" | 200 OK | ✅ |
| TC-MNT-006 | Add comment | Comment text | 200 OK | ✅ |
| TC-MNT-007 | Filter by priority | priority = "emergency" | 200 OK, filtered | ✅ |
| TC-MNT-008 | Filter by status | status = "pending" | 200 OK, filtered | ✅ |
| TC-MNT-009 | Assign to manager | assignedTo = managerId | 200 OK | ✅ |

---

### 6. Payments Module

| # | Test Case | Input | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| TC-PAY-001 | Record payment (Tenant) | Valid payment data | 201 Created | ✅ |
| TC-PAY-002 | Record with invalid amount | amount = -100 | 400 Bad Request | ✅ |
| TC-PAY-003 | List payments (Admin) | Admin token | 200 OK, all payments | ✅ |
| TC-PAY-004 | List own payments (Tenant) | Tenant token | 200 OK, own payments | ✅ |
| TC-PAY-005 | Filter by status | status = "overdue" | 200 OK, filtered | ✅ |
| TC-PAY-006 | Filter by month/year | month=2, year=2024 | 200 OK, filtered | ✅ |
| TC-PAY-007 | Update payment (Admin) | Updated fields | 200 OK | ✅ |
| TC-PAY-008 | Duplicate payment | Same lease, month, year | 400 Bad Request | ✅ |

---

### 7. Frontend Component Tests

| # | Test Case | Component | Expected Result | Status |
|---|-----------|-----------|-----------------|--------|
| TC-FE-001 | Login form renders | LoginPage | Shows email, password fields and submit button | ✅ |
| TC-FE-002 | Login form validation | LoginPage | Shows errors for empty fields | ✅ |
| TC-FE-003 | Register form renders | RegisterPage | Shows all registration fields | ✅ |
| TC-FE-004 | Dashboard renders (Admin) | AdminDashboard | Shows stats cards and charts | ✅ |
| TC-FE-005 | Dashboard renders (Owner) | OwnerDashboard | Shows property portfolio | ✅ |
| TC-FE-006 | Dashboard renders (Tenant) | TenantDashboard | Shows lease and payment info | ✅ |
| TC-FE-007 | Property list renders | PropertyList | Shows property cards | ✅ |
| TC-FE-008 | Property form validation | PropertyForm | Validates required fields | ✅ |
| TC-FE-009 | Navigation by role | Sidebar | Shows role-appropriate menu items | ✅ |
| TC-FE-010 | Protected route redirect | ProtectedRoute | Redirects unauthenticated to login | ✅ |
| TC-FE-011 | Logout clears session | NavBar | Removes token, redirects to login | ✅ |
| TC-FE-012 | Maintenance form | MaintenanceForm | Validates and submits request | ✅ |
| TC-FE-013 | Payment history table | PaymentList | Renders payment records correctly | ✅ |
| TC-FE-014 | Search functionality | PropertyList | Filters displayed properties | ✅ |
| TC-FE-015 | Responsive layout | All pages | Displays correctly on mobile/tablet | ✅ |

---

## Expected Results Summary

### Backend API Tests

| Module | Total Tests | Expected Pass | Expected Fail |
|--------|------------|---------------|---------------|
| Authentication | 16 | 16 | 0 |
| Properties | 19 | 19 | 0 |
| Tenants | 7 | 7 | 0 |
| Leases | 7 | 7 | 0 |
| Maintenance | 9 | 9 | 0 |
| Payments | 8 | 8 | 0 |
| **Total** | **66** | **66** | **0** |

### Frontend Tests

| Category | Total Tests | Expected Pass | Expected Fail |
|----------|------------|---------------|---------------|
| Component Tests | 15 | 15 | 0 |
| **Total** | **15** | **15** | **0** |

---

## Test Data

### Seed Data for Tests

The seed script (`backend/seeds/seed.js`) creates the following test data:

| Data Type | Count | Details |
|-----------|-------|---------|
| Users | 4 | One per role (admin, owner, tenant, manager) |
| Properties | 3 | Various types (apartment, house, condo) |
| Tenants | 2 | Assigned to different properties |
| Leases | 2 | Active leases with different terms |
| Maintenance Requests | 3 | Different priorities and statuses |
| Payments | 4 | Mix of paid, pending, overdue |

---

## Continuous Integration

### Recommended CI Pipeline

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test -- --coverage
    env:
      MONGODB_URI: mongodb://localhost:27017/property_rental_test
      JWT_SECRET: test_secret_key
      NODE_ENV: test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test -- --coverage
```

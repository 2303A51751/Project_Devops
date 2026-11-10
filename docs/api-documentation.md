# API Documentation

## Overview

The Property Rental and Tenant Management Platform exposes a RESTful API built with Express.js. All endpoints follow standard HTTP conventions and return JSON responses.

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`

---

## Authentication

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Tokens are obtained via the login endpoint and expire after the configured `JWT_EXPIRE` period (default: 7 days).

---

## Status Codes

| Code | Description |
|------|-------------|
| `200` | OK — Request successful |
| `201` | Created — Resource created successfully |
| `400` | Bad Request — Invalid input or validation error |
| `401` | Unauthorized — Missing or invalid token |
| `403` | Forbidden — Insufficient permissions |
| `404` | Not Found — Resource does not exist |
| `500` | Internal Server Error — Server-side failure |

---

## API Endpoints

### Health Check

#### `GET /api/health`

Check if the API server is running.

- **Auth Required**: No

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Authentication (`/api/auth`)

#### `POST /api/auth/register`

Register a new user account.

- **Auth Required**: No

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "tenant"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name (2-50 characters) |
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Password (minimum 6 characters) |
| `role` | string | Yes | One of: `owner`, `tenant`, `manager` |

**Response** `201 Created`:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "tenant"
  }
}
```

**Error** `400 Bad Request`:
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

#### `POST /api/auth/login`

Authenticate user and receive JWT token.

- **Auth Required**: No

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Registered email address |
| `password` | string | Yes | Account password |

**Response** `200 OK`:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "tenant"
  }
}
```

**Error** `401 Unauthorized`:
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

#### `GET /api/auth/me`

Get current authenticated user's profile.

- **Auth Required**: Yes

**Response** `200 OK`:
```json
{
  "success": true,
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "tenant",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Properties (`/api/properties`)

#### `GET /api/properties`

Get all properties (filtered by role).

- **Auth Required**: Yes
- **Roles**: All (filtered by ownership/assignment)

**Query Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `search` | string | Search by name or address |
| `type` | string | Filter by property type |
| `status` | string | Filter by status (available/occupied) |

**Response** `200 OK`:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Sunset Apartments",
      "address": "123 Main St, City, State 12345",
      "type": "apartment",
      "units": 12,
      "rentAmount": 1500,
      "status": "available",
      "owner": {
        "_id": "65a1...",
        "name": "Jane Owner"
      },
      "description": "Modern apartment complex with amenities",
      "amenities": ["parking", "laundry", "gym"],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### `POST /api/properties`

Create a new property.

- **Auth Required**: Yes
- **Roles**: Admin, Owner

**Request Body**:
```json
{
  "name": "Sunset Apartments",
  "address": "123 Main St, City, State 12345",
  "type": "apartment",
  "units": 12,
  "rentAmount": 1500,
  "description": "Modern apartment complex",
  "amenities": ["parking", "laundry", "gym"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Property name |
| `address` | string | Yes | Full address |
| `type` | string | Yes | `apartment`, `house`, `condo`, `commercial` |
| `units` | number | Yes | Number of units |
| `rentAmount` | number | Yes | Monthly rent amount |
| `description` | string | No | Property description |
| `amenities` | array | No | List of amenities |

**Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Sunset Apartments",
    "address": "123 Main St, City, State 12345",
    "type": "apartment",
    "units": 12,
    "rentAmount": 1500,
    "owner": "65a1...",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### `GET /api/properties/:id`

Get a single property by ID.

- **Auth Required**: Yes
- **Roles**: All

**Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Sunset Apartments",
    "address": "123 Main St, City, State 12345",
    "type": "apartment",
    "units": 12,
    "rentAmount": 1500,
    "owner": {
      "_id": "65a1...",
      "name": "Jane Owner",
      "email": "jane@example.com"
    },
    "description": "Modern apartment complex",
    "amenities": ["parking", "laundry", "gym"],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### `PUT /api/properties/:id`

Update a property.

- **Auth Required**: Yes
- **Roles**: Admin, Owner (own properties only)

**Request Body**: Same fields as POST (all optional)

**Response** `200 OK`:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### `DELETE /api/properties/:id`

Delete a property.

- **Auth Required**: Yes
- **Roles**: Admin, Owner (own properties only)

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

### Tenants (`/api/tenants`)

#### `GET /api/tenants`

Get all tenants.

- **Auth Required**: Yes
- **Roles**: Admin, Owner, Manager

**Response** `200 OK`:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65a1...",
      "user": {
        "_id": "65a1...",
        "name": "Bob Tenant",
        "email": "bob@example.com"
      },
      "property": {
        "_id": "65a1...",
        "name": "Sunset Apartments"
      },
      "unit": "3A",
      "moveInDate": "2024-01-01",
      "status": "active"
    }
  ]
}
```

---

#### `POST /api/tenants`

Add a new tenant.

- **Auth Required**: Yes
- **Roles**: Admin, Owner

**Request Body**:
```json
{
  "user": "65a1b2c3d4e5f6g7h8i9j0k1",
  "property": "65a1b2c3d4e5f6g7h8i9j0k2",
  "unit": "3A",
  "moveInDate": "2024-01-01",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "555-0123",
    "relationship": "Spouse"
  }
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### `GET /api/tenants/:id`

Get a single tenant by ID.

- **Auth Required**: Yes

**Response** `200 OK`:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### `PUT /api/tenants/:id`

Update tenant information.

- **Auth Required**: Yes
- **Roles**: Admin, Owner

**Response** `200 OK`:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### `DELETE /api/tenants/:id`

Remove a tenant.

- **Auth Required**: Yes
- **Roles**: Admin, Owner

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Tenant removed successfully"
}
```

---

### Leases (`/api/leases`)

#### `GET /api/leases`

Get all leases.

- **Auth Required**: Yes
- **Roles**: All (filtered by role)

**Response** `200 OK`:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65a1...",
      "tenant": {
        "_id": "65a1...",
        "user": { "name": "Bob Tenant" }
      },
      "property": {
        "_id": "65a1...",
        "name": "Sunset Apartments"
      },
      "unit": "3A",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "rentAmount": 1500,
      "securityDeposit": 3000,
      "status": "active",
      "paymentDueDay": 1
    }
  ]
}
```

---

#### `POST /api/leases`

Create a new lease.

- **Auth Required**: Yes
- **Roles**: Admin, Owner

**Request Body**:
```json
{
  "tenant": "65a1b2c3d4e5f6g7h8i9j0k1",
  "property": "65a1b2c3d4e5f6g7h8i9j0k2",
  "unit": "3A",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "rentAmount": 1500,
  "securityDeposit": 3000,
  "paymentDueDay": 1,
  "terms": "Standard lease terms apply"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tenant` | ObjectId | Yes | Tenant ID |
| `property` | ObjectId | Yes | Property ID |
| `unit` | string | Yes | Unit number |
| `startDate` | date | Yes | Lease start date |
| `endDate` | date | Yes | Lease end date |
| `rentAmount` | number | Yes | Monthly rent |
| `securityDeposit` | number | Yes | Security deposit amount |
| `paymentDueDay` | number | No | Day of month rent is due (default: 1) |
| `terms` | string | No | Additional lease terms |

**Response** `201 Created`:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### `PUT /api/leases/:id`

Update a lease.

- **Auth Required**: Yes
- **Roles**: Admin, Owner

**Response** `200 OK`

---

#### `DELETE /api/leases/:id`

Delete a lease.

- **Auth Required**: Yes
- **Roles**: Admin

**Response** `200 OK`

---

### Maintenance Requests (`/api/maintenance`)

#### `GET /api/maintenance`

Get all maintenance requests.

- **Auth Required**: Yes
- **Roles**: All (filtered by role)

**Query Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter: `pending`, `in-progress`, `completed` |
| `priority` | string | Filter: `low`, `medium`, `high`, `emergency` |
| `property` | ObjectId | Filter by property |

**Response** `200 OK`:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65a1...",
      "title": "Leaking faucet in kitchen",
      "description": "The kitchen faucet has been dripping for 2 days",
      "property": {
        "_id": "65a1...",
        "name": "Sunset Apartments"
      },
      "unit": "3A",
      "tenant": {
        "_id": "65a1...",
        "user": { "name": "Bob Tenant" }
      },
      "priority": "medium",
      "status": "pending",
      "comments": [],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### `POST /api/maintenance`

Create a new maintenance request.

- **Auth Required**: Yes
- **Roles**: All

**Request Body**:
```json
{
  "title": "Leaking faucet in kitchen",
  "description": "The kitchen faucet has been dripping for 2 days",
  "property": "65a1b2c3d4e5f6g7h8i9j0k2",
  "unit": "3A",
  "priority": "medium"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Brief description |
| `description` | string | Yes | Detailed description |
| `property` | ObjectId | Yes | Property ID |
| `unit` | string | Yes | Unit number |
| `priority` | string | No | `low`, `medium`, `high`, `emergency` (default: `medium`) |

**Response** `201 Created`:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### `PUT /api/maintenance/:id`

Update a maintenance request (status, add comments, assign).

- **Auth Required**: Yes
- **Roles**: Admin, Owner, Manager

**Request Body**:
```json
{
  "status": "in-progress",
  "comment": "Plumber scheduled for tomorrow",
  "assignedTo": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### `DELETE /api/maintenance/:id`

Delete a maintenance request.

- **Auth Required**: Yes
- **Roles**: Admin

**Response** `200 OK`

---

### Payments (`/api/payments`)

#### `GET /api/payments`

Get all payment records.

- **Auth Required**: Yes
- **Roles**: All (filtered by role)

**Query Parameters**:

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter: `pending`, `paid`, `overdue` |
| `tenant` | ObjectId | Filter by tenant |
| `lease` | ObjectId | Filter by lease |
| `month` | number | Filter by month (1-12) |
| `year` | number | Filter by year |

**Response** `200 OK`:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "65a1...",
      "lease": {
        "_id": "65a1...",
        "property": { "name": "Sunset Apartments" },
        "unit": "3A"
      },
      "tenant": {
        "_id": "65a1...",
        "user": { "name": "Bob Tenant" }
      },
      "amount": 1500,
      "dueDate": "2024-02-01",
      "paidDate": "2024-01-28",
      "status": "paid",
      "paymentMethod": "bank_transfer",
      "month": 2,
      "year": 2024
    }
  ]
}
```

---

#### `POST /api/payments`

Record a new payment.

- **Auth Required**: Yes
- **Roles**: Admin, Owner, Tenant

**Request Body**:
```json
{
  "lease": "65a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 1500,
  "paymentMethod": "bank_transfer",
  "month": 2,
  "year": 2024,
  "notes": "February rent payment"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lease` | ObjectId | Yes | Lease ID |
| `amount` | number | Yes | Payment amount |
| `paymentMethod` | string | No | `cash`, `bank_transfer`, `check`, `online` |
| `month` | number | Yes | Payment month |
| `year` | number | Yes | Payment year |
| `notes` | string | No | Additional notes |

**Response** `201 Created`:
```json
{
  "success": true,
  "data": { ... }
}
```

---

#### `PUT /api/payments/:id`

Update a payment record.

- **Auth Required**: Yes
- **Roles**: Admin, Owner

**Response** `200 OK`

---

#### `DELETE /api/payments/:id`

Delete a payment record.

- **Auth Required**: Yes
- **Roles**: Admin

**Response** `200 OK`

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

For validation errors:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Please provide a valid email" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

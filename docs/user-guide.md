# User Guide

## Overview

The Property Rental and Tenant Management Platform is a web-based application that helps property owners, tenants, and managers efficiently manage rental properties. This guide walks you through the platform's features based on your role.

---

## Getting Started

### Accessing the Application

| Deployment | URL |
|-----------|-----|
| Local Development | http://localhost:5173 |
| Docker | http://localhost |
| Kubernetes | http://rental.local |

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rental.com | admin123 |
| Owner | owner@rental.com | owner123 |
| Tenant | tenant@rental.com | tenant123 |
| Manager | manager@rental.com | manager123 |

### Creating a New Account

1. Navigate to the **Register** page
2. Fill in your details:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
   - Role (Owner, Tenant, or Manager)
3. Click **Register**
4. You will be redirected to your role-specific dashboard

### Logging In

1. Navigate to the **Login** page
2. Enter your email and password
3. Click **Login**
4. You will be redirected to your dashboard

---

## Admin Workflows

The Admin role has full access to all platform features and can manage all users, properties, and data.

### Dashboard

The admin dashboard provides a platform-wide overview including:
- Total number of users, properties, tenants, and leases
- Recent activity feed
- System health metrics
- Revenue summaries

### Managing Users

1. Navigate to **Users** in the sidebar
2. View the list of all registered users
3. Filter by role (Admin, Owner, Tenant, Manager)
4. Click on a user to view their details
5. Edit user information or change roles as needed

### Managing Properties

1. Navigate to **Properties** in the sidebar
2. View all properties across all owners
3. Search by name or address
4. Filter by property type or status
5. Click on a property to view full details
6. Edit or delete properties as needed

### Managing Leases

1. Navigate to **Leases** in the sidebar
2. View all active and expired leases
3. Filter by status (active, expired, terminated)
4. Create new leases or modify existing ones

### Managing Payments

1. Navigate to **Payments** in the sidebar
2. View all payment records
3. Filter by status (pending, paid, overdue)
4. Track revenue across all properties

### Managing Maintenance

1. Navigate to **Maintenance** in the sidebar
2. View all maintenance requests
3. Assign requests to managers or maintenance staff
4. Update request status and add comments

---

## Owner Workflows

Property owners can manage their properties, tenants, leases, and track payments.

### Dashboard

The owner dashboard shows:
- Number of owned properties
- Total tenants across properties
- Active leases
- Monthly revenue
- Pending maintenance requests

### Adding a New Property

1. Navigate to **Properties** → **Add Property**
2. Fill in property details:
   - **Property Name**: e.g., "Sunset Apartments"
   - **Address**: Full street address
   - **Type**: Apartment, House, Condo, or Commercial
   - **Number of Units**: Total available units
   - **Rent Amount**: Monthly rent per unit
   - **Description**: Property description
   - **Amenities**: Available amenities (parking, laundry, gym, etc.)
3. Click **Save**

### Managing Existing Properties

1. Navigate to **Properties**
2. View your property portfolio
3. Click on a property to see details
4. Use **Edit** to update information
5. Use **Delete** to remove a property (requires confirmation)

### Adding a Tenant

1. Navigate to **Tenants** → **Add Tenant**
2. Select the tenant's user account
3. Assign them to a property and unit
4. Set the move-in date
5. Add emergency contact information
6. Click **Save**

### Creating a Lease

1. Navigate to **Leases** → **Create Lease**
2. Select the tenant
3. Select the property and unit
4. Set lease terms:
   - Start Date
   - End Date
   - Monthly Rent Amount
   - Security Deposit
   - Payment Due Day
   - Additional Terms
5. Click **Create Lease**

### Tracking Payments

1. Navigate to **Payments**
2. View payment history for all tenants
3. Filter by property, tenant, status, or date
4. Record manual payments if needed
5. Monitor overdue payments

### Handling Maintenance Requests

1. Navigate to **Maintenance**
2. View requests submitted by tenants
3. Click on a request to see details
4. Update status: Pending → In Progress → Completed
5. Assign to a manager if applicable
6. Add comments with updates

---

## Tenant Workflows

Tenants can view their lease details, make payments, and submit maintenance requests.

### Dashboard

The tenant dashboard shows:
- Current lease information
- Upcoming rent payment due date
- Payment history
- Maintenance request status

### Viewing Lease Details

1. Navigate to **My Lease** in the sidebar
2. View your current lease information:
   - Property and unit details
   - Lease start and end dates
   - Monthly rent amount
   - Security deposit
   - Payment due day

### Making Payments

1. Navigate to **Payments**
2. View your payment history and upcoming dues
3. Click **Make Payment**
4. Confirm the payment amount
5. Select payment method
6. Add any notes
7. Click **Submit Payment**

### Submitting a Maintenance Request

1. Navigate to **Maintenance** → **New Request**
2. Fill in the request:
   - **Title**: Brief summary (e.g., "Leaking faucet")
   - **Description**: Detailed explanation of the issue
   - **Priority**: Low, Medium, High, or Emergency
3. Click **Submit**
4. Track the status on the Maintenance page

### Tracking Maintenance Requests

1. Navigate to **Maintenance**
2. View all your submitted requests
3. Check status updates: Pending → In Progress → Completed
4. Read comments from maintenance staff
5. Add follow-up comments if needed

---

## Manager Workflows

Managers oversee assigned properties, handle tenant interactions, and manage maintenance.

### Dashboard

The manager dashboard shows:
- Number of assigned properties
- Active tenants under management
- Pending maintenance requests
- Recent activity

### Viewing Assigned Properties

1. Navigate to **Properties**
2. View properties assigned to you
3. Click on a property to see details and tenant list

### Managing Tenants

1. Navigate to **Tenants**
2. View tenants in your assigned properties
3. Click on a tenant to see their details and lease information
4. Update tenant information as needed

### Handling Maintenance Requests

1. Navigate to **Maintenance**
2. View all requests for assigned properties
3. Prioritize by urgency (Emergency → High → Medium → Low)
4. Update status as work progresses:
   - Set to **In Progress** when work begins
   - Add comments with updates
   - Set to **Completed** when resolved
5. Coordinate with tenants via comments

### Viewing Leases and Payments

1. Navigate to **Leases** to view active leases
2. Navigate to **Payments** to monitor payment status
3. Report issues to property owners as needed

---

## Common Tasks

### Updating Your Profile

1. Click your name or avatar in the top-right corner
2. Select **Profile**
3. Update your name, email, or phone number
4. Click **Save Changes**

### Changing Your Password

1. Go to **Profile** → **Security**
2. Enter your current password
3. Enter and confirm your new password
4. Click **Update Password**

### Logging Out

1. Click your name or avatar in the top-right corner
2. Select **Logout**
3. You will be redirected to the login page

### Searching and Filtering

Most list pages support:
- **Search**: Type in the search bar to filter by name/title
- **Filters**: Use dropdown menus to filter by status, type, priority, etc.
- **Sort**: Click column headers to sort ascending/descending

---

## Tips and Best Practices

- **Owners**: Regularly review maintenance requests to keep tenants satisfied
- **Tenants**: Submit maintenance requests promptly and provide detailed descriptions
- **Managers**: Prioritize emergency maintenance requests immediately
- **All Users**: Keep your contact information up to date
- **Security**: Use a strong, unique password and log out when using shared devices

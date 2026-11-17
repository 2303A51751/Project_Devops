# Turnkey Render Deployment Guide

This guide walks you through deploying the **Property Rental and Tenant Management Platform** to [Render](https://render.com) using the free tier.

---

## Architecture on Render

```
  [User Browser]
         │
         ▼
  ┌───────────────────────────────────────────────┐
  │  Render Static Site (Frontend React 18)       │
  │  URL: https://property-rental-frontend.onrender.com │
  └───────────────────────┬───────────────────────┘
                          │ (API Calls via VITE_API_URL)
                          ▼
  ┌───────────────────────────────────────────────┐
  │  Render Web Service (Backend Node.js / Express)│
  │  URL: https://property-rental-backend.onrender.com  │
  └───────────────────────┬───────────────────────┘
                          │ (Mongoose connection)
                          ▼
  ┌───────────────────────────────────────────────┐
  │  MongoDB Atlas Cloud Database (Free M0 Cluster)│
  │  mongodb+srv://...                            │
  └───────────────────────────────────────────────┘
```

---

## Prerequisites

1. **GitHub Account**: Your project is hosted at [https://github.com/2303A51751/Project_Devops.git](https://github.com/2303A51751/Project_Devops.git).
2. **Render Account**: Sign up at [https://render.com](https://render.com) (free, sign in with GitHub).
3. **MongoDB Atlas Account**: Sign up at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (free M0 shared cluster).

---

## Step 1: Set Up Free MongoDB Atlas Database

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Click **Create** to deploy a database:
   - Select **M0 Free Tier** (Shared).
   - Choose any provider & region close to you (e.g. AWS / us-east-1).
   - Click **Create Deployment**.
3. **Set up Database User**:
   - Username: `admin` (or your choice).
   - Password: Autogenerate or create a strong password (e.g. `RentalPass2026!`). Note it down.
4. **Network Access (IP Whitelist)**:
   - Go to **Network Access** → **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`).
   - Click **Confirm** (Render services use dynamic IPs, so `0.0.0.0/0` is required).
5. **Get Connection String**:
   - Go to **Database** → **Connect** → **Drivers** (Node.js).
   - Copy your connection string, which looks like:
     ```
     mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/property_rental?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and specify `/property_rental` as the database name.

---

## Step 2: Option A — One-Click Automated Blueprint Deployment (Recommended)

The repository includes a ready-to-use [`render.yaml`](../render.yaml) blueprint file.

1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** (top right) → **Blueprint**.
3. Connect your repository: `2303A51751/Project_Devops`.
4. Render will detect `render.yaml` and configure two services:
   - **`property-rental-backend`** (Web Service)
   - **`property-rental-frontend`** (Static Site)
5. Under `property-rental-backend`, enter your **`MONGODB_URI`** from Step 1.
6. Click **Apply**.
7. Render will automatically build and deploy both services!

---

## Step 2: Option B — Manual Service Creation in Render Dashboard

If you prefer manual setup:

### A. Deploy Backend Web Service

1. On Render Dashboard, click **New +** → **Web Service**.
2. Select **Build and deploy from a Git repository** → select `2303A51751/Project_Devops`.
3. Configure the settings:
   - **Name**: `property-rental-backend`
   - **Region**: Oregon or Ohio (closest to your DB)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | Render maps port dynamically |
   | `MONGODB_URI` | `mongodb+srv://admin:pass@cluster0...` | Your Atlas connection URI |
   | `JWT_SECRET` | `pr0p3rty_r3nt4l_s3cr3t_k3y_2026_cloud` | 32+ char secret string |
   | `JWT_EXPIRE` | `7d` | Token expiry duration |
5. Click **Create Web Service**.
6. Wait 2 minutes for deployment. Once ready, copy your Backend URL (e.g. `https://property-rental-backend-xxxx.onrender.com`).
7. Test the health endpoint in your browser:
   `https://property-rental-backend-xxxx.onrender.com/api/health` → returns `{"status":"OK"}`.

### B. Deploy Frontend Static Site

1. On Render Dashboard, click **New +** → **Static Site**.
2. Select repository: `2303A51751/Project_Devops`.
3. Configure the settings:
   - **Name**: `property-rental-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://property-rental-backend-xxxx.onrender.com` (Your backend URL from step A) |
5. Under **Redirects/Rewrites**:
   - Click **Add Rule**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   *(This ensures client-side routing like `/login`, `/properties`, `/admin/dashboard` works when refreshed directly).*
6. Click **Create Static Site**.

---

## Step 3: Automated Database Seeding

When your backend boots for the first time against an empty MongoDB Atlas database, it will automatically detect zero records and trigger the built-in enterprise seeder:
- **75 Users** (Admins, Owners, Managers, Tenants)
- **8 Properties & 40 Units**
- **55 Bookings** (30 Leases + 25 Rental Applications)
- **40 Facility Repairs** (5 tickets across each of the 8 categories)
- **30 Payment Records & 30 Activity Logs**

---

## Step 4: Login with Default Credentials

Once the frontend finishes deploying, open its URL (e.g. `https://property-rental-frontend-xxxx.onrender.com`) and log in:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@propertymanager.com` | `admin123` |
| **Owner** | `owner1@test.com` | `owner123` |
| **Manager** | `manager1@test.com` | `manager123` |
| **Tenant** | `tenant1@test.com` | `tenant123` |

You can also use the one-click credential buttons on the login screen.

---

## Common Troubleshooting

1. **Backend Free Tier Spin-Down**:
   Render's free web services sleep after 15 minutes of inactivity. The first request after sleep may take ~30-50 seconds to spin up. This is normal behavior on the free tier.
2. **Direct URL Refresh returns 404**:
   Make sure you added the **Rewrite rule** in your Frontend Static Site: `/*` → `/index.html`.
3. **Database connection timeout (`MongooseServerSelectionError`)**:
   Verify that **Network Access** in MongoDB Atlas has `0.0.0.0/0` (Allow from anywhere) enabled.

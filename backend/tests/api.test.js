const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;
let adminToken;
let ownerToken;
let tenantToken;
let createdPropertyId;
let createdUnitId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret_jwt_key_super_secure_12345';
  process.env.JWT_EXPIRE = '1d';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('=== Property Rental Platform End-to-End Test Suite ===', () => {
  // 1. Healthcheck
  test('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  // 2. Auth: Registration
  test('POST /api/auth/register should fail on validation error', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bad User',
      email: 'not-an-email',
      password: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register should create admin, owner, and tenant users', async () => {
    // Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Super Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    expect(adminRes.status).toBe(201);
    expect(adminRes.body.token).toBeDefined();
    adminToken = adminRes.body.token;

    // Owner
    const ownerRes = await request(app).post('/api/auth/register').send({
      name: 'Property Owner 1',
      email: 'owner@test.com',
      password: 'password123',
      role: 'owner',
    });
    expect(ownerRes.status).toBe(201);
    expect(ownerRes.body.token).toBeDefined();
    ownerToken = ownerRes.body.token;

    // Tenant
    const tenantRes = await request(app).post('/api/auth/register').send({
      name: 'John Tenant',
      email: 'tenant@test.com',
      password: 'password123',
      role: 'tenant',
    });
    expect(tenantRes.status).toBe(201);
    expect(tenantRes.body.token).toBeDefined();
    tenantToken = tenantRes.body.token;
  });

  // 3. Auth: Login
  test('POST /api/auth/login should authenticate registered user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.data.role).toBe('admin');
  });

  // 4. Auth: Profile (GET /api/auth/me)
  test('GET /api/auth/me should return logged in user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tenantToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('tenant@test.com');
  });

  // 5. Properties CRUD
  test('POST /api/properties should create a new property for Owner', async () => {
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Sunset Modern Residences',
        description: 'Luxury high-rise residential complex with city views',
        address: {
          street: '100 Ocean Drive',
          city: 'Miami',
          state: 'FL',
          zipCode: '33139',
          country: 'USA',
        },
        type: 'apartment',
        totalUnits: 4,
        parkingSpaces: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Sunset Modern Residences');
    createdPropertyId = res.body.data._id;
  });

  test('GET /api/properties should list all properties', async () => {
    const res = await request(app).get('/api/properties');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // 6. Units CRUD
  test('POST /api/units should create a rental unit within property', async () => {
    const res = await request(app)
      .post('/api/units')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        property: createdPropertyId,
        unitNumber: '101',
        floor: 1,
        bedrooms: 2,
        bathrooms: 2,
        area: 950,
        monthlyRent: 2200,
        securityDeposit: 2200,
        status: 'available',
        description: '2BR 2BA upgraded suite with balcony',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.unitNumber).toBe('101');
    createdUnitId = res.body.data._id;
  });

  test('GET /api/units/available/list should include the created unit', async () => {
    const res = await request(app).get('/api/units/available/list');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // 7. Applications Workflow
  test('POST /api/applications should allow tenant to submit rental application', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        unit: createdUnitId,
        moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        employmentInfo: {
          employer: 'Tech Corp',
          position: 'Software Developer',
          monthlyIncome: 8000,
        },
        previousAddress: '50 Elm St, Boston, MA',
        message: 'Looking forward to moving in!',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
  });

  // 8. Reports API
  test('GET /api/reports/property-availability should compute live availability statistics', async () => {
    const res = await request(app)
      .get('/api/reports/property-availability')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('summary');
    expect(res.body.data.summary).toHaveProperty('totalProperties');
    expect(res.body.data.summary).toHaveProperty('totalUnits');
    expect(res.body.data.summary).toHaveProperty('availableUnits');
    expect(res.body.data).toHaveProperty('propertyBreakdown');
  });

  test('GET /api/reports/rent-collection should return rent metrics', async () => {
    const res = await request(app)
      .get('/api/reports/rent-collection')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('summary');
    expect(res.body.data.summary).toHaveProperty('totalExpectedMonthly');
    expect(res.body.data).toHaveProperty('monthlyTrends');
  });

  test('GET /api/reports/lease-expiry should return lease statistics', async () => {
    const res = await request(app)
      .get('/api/reports/lease-expiry')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('summary');
    expect(res.body.data.summary).toHaveProperty('active');
    expect(res.body.data).toHaveProperty('expiringIn30Days');
    expect(res.body.data).toHaveProperty('expiringIn60Days');
  });

  test('GET /api/reports/maintenance should return maintenance statistics', async () => {
    const res = await request(app)
      .get('/api/reports/maintenance')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('summary');
    expect(res.body.data.summary).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('byCategory');
    expect(res.body.data).toHaveProperty('byPriority');
  });
});

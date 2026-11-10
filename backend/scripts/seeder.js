const User = require('../models/User');
const Property = require('../models/Property');
const Unit = require('../models/Unit');
const RentalApplication = require('../models/RentalApplication');
const Lease = require('../models/Lease');
const Payment = require('../models/Payment');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const seedData = async () => {
  console.log('📦 Seeding database collections...');

  // Clear existing records
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Unit.deleteMany({}),
    RentalApplication.deleteMany({}),
    Lease.deleteMany({}),
    Payment.deleteMany({}),
    MaintenanceRequest.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  // 1. Create Users
  const usersData = [
    {
      name: 'System Administrator',
      email: 'admin@propertymanager.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-555-0100',
      address: '100 Admin Plaza, Suite 400, New York, NY 10001',
    },
    {
      name: 'Sarah Jenkins (Owner)',
      email: 'owner1@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0101',
      address: '250 Park Avenue, New York, NY 10017',
    },
    {
      name: 'Robert Vance (Owner)',
      email: 'owner2@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0102',
      address: '500 Boylston Street, Boston, MA 02116',
    },
    {
      name: 'Alex Rivera (Manager)',
      email: 'manager1@test.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1-555-0103',
      address: '120 Broadway, New York, NY 10271',
    },
    {
      name: 'Elena Rostova (Manager)',
      email: 'manager2@test.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1-555-0104',
      address: '75 State Street, Boston, MA 02109',
    },
    {
      name: 'David Miller (Tenant)',
      email: 'tenant1@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0105',
      address: 'Apt 101, Grand Horizon, New York, NY 10001',
    },
    {
      name: 'Emily Watson (Tenant)',
      email: 'tenant2@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0106',
      address: 'Apt 202, Grand Horizon, New York, NY 10001',
    },
    {
      name: 'Carlos Mendez (Tenant)',
      email: 'tenant3@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0107',
      address: 'Unit 3A, Beacon Hill, Boston, MA 02108',
    },
    {
      name: 'Aisha Patel (Tenant)',
      email: 'tenant4@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0108',
      address: 'Unit 1B, Silverstone, Miami, FL 33139',
    },
    {
      name: 'Liam O\'Connor (Tenant)',
      email: 'tenant5@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0109',
      address: 'Unit 4C, Silverstone, Miami, FL 33139',
    },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await User.create(u);
    createdUsers.push(user);
  }

  const [admin, owner1, owner2, manager1, manager2, tenant1, tenant2, tenant3, tenant4, tenant5] = createdUsers;

  // 2. Create Properties
  const propertiesData = [
    {
      title: 'Grand Horizon Luxury Residences',
      description: 'Ultra-modern luxury apartment complex with panoramic skyline views, 24/7 concierge, rooftop pool, and fitness center.',
      address: {
        street: '450 West 42nd Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10036',
        country: 'USA',
      },
      type: 'apartment',
      owner: owner1._id,
      manager: manager1._id,
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      ],
      amenities: ['Gym', 'Pool', 'Concierge', 'Rooftop Deck', 'Parking', 'Elevator', 'Pet Friendly'],
      totalUnits: 3,
      yearBuilt: 2021,
      parkingSpaces: 40,
    },
    {
      title: 'Silverstone Waterfront Condominiums',
      description: 'Premier coastal residential towers situated directly on the South Beach shoreline with private dock access and spa.',
      address: {
        street: '100 Ocean Drive',
        city: 'Miami',
        state: 'FL',
        zipCode: '33139',
        country: 'USA',
      },
      type: 'condo',
      owner: owner1._id,
      manager: manager1._id,
      images: [
        'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      ],
      amenities: ['Waterfront', 'Private Beach', 'Spa', 'Valet Parking', 'Tennis Court'],
      totalUnits: 2,
      yearBuilt: 2019,
      parkingSpaces: 30,
    },
    {
      title: 'Beacon Hill Historic Brownstones',
      description: 'Meticulously preserved 19th-century brownstone townhomes offering classic architectural charm coupled with modern interior finishes.',
      address: {
        street: '72 Mount Vernon Street',
        city: 'Boston',
        state: 'MA',
        zipCode: '02108',
        country: 'USA',
      },
      type: 'townhouse',
      owner: owner2._id,
      manager: manager2._id,
      images: [
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      ],
      amenities: ['Fireplace', 'Hardwood Floors', 'Private Garden', 'Wine Cellar'],
      totalUnits: 2,
      yearBuilt: 1910,
      parkingSpaces: 10,
    },
  ];

  const properties = [];
  for (const p of propertiesData) {
    const prop = await Property.create(p);
    properties.push(prop);
  }

  // 3. Create Units
  const unitsData = [
    {
      property: properties[0]._id,
      unitNumber: '101',
      floor: 1,
      bedrooms: 1,
      bathrooms: 1,
      area: 750,
      monthlyRent: 2200,
      securityDeposit: 2200,
      status: 'occupied',
      currentTenant: tenant1._id,
      description: 'Bright 1BR with oversized floor-to-ceiling windows and Italian marble finishes.',
    },
    {
      property: properties[0]._id,
      unitNumber: '202',
      floor: 2,
      bedrooms: 2,
      bathrooms: 2,
      area: 1150,
      monthlyRent: 3100,
      securityDeposit: 3100,
      status: 'occupied',
      currentTenant: tenant2._id,
      description: 'Spacious 2BR corner suite with private wrap-around terrace.',
    },
    {
      property: properties[0]._id,
      unitNumber: '305',
      floor: 3,
      bedrooms: 3,
      bathrooms: 2.5,
      area: 1600,
      monthlyRent: 4500,
      securityDeposit: 4500,
      status: 'available',
      description: 'Penthouse-level 3BR with direct private elevator foyer.',
    },
    {
      property: properties[1]._id,
      unitNumber: '4B',
      floor: 4,
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      monthlyRent: 3800,
      securityDeposit: 3800,
      status: 'available',
      description: 'Direct ocean-facing unit with panoramic balcony.',
    },
    {
      property: properties[2]._id,
      unitNumber: '1A',
      floor: 1,
      bedrooms: 2,
      bathrooms: 1.5,
      area: 980,
      monthlyRent: 2800,
      securityDeposit: 2800,
      status: 'occupied',
      currentTenant: tenant3._id,
      description: 'Historic brownstone unit with exposed brick and working fireplace.',
    },
  ];

  const units = [];
  for (const u of unitsData) {
    const unit = await Unit.create(u);
    units.push(unit);
  }

  // 4. Create Leases
  const oneYearAgo = new Date();
  oneYearAgo.setMonth(oneYearAgo.getMonth() - 6);
  const sixMonthsFuture = new Date();
  sixMonthsFuture.setMonth(sixMonthsFuture.getMonth() + 6);

  const leasesData = [
    {
      leaseNumber: 'LSE-2026-0001',
      tenant: tenant1._id,
      property: properties[0]._id,
      unit: units[0]._id,
      startDate: oneYearAgo,
      endDate: sixMonthsFuture,
      monthlyRent: 2200,
      securityDeposit: 2200,
      status: 'active',
      paymentDueDay: 1,
      terms: 'Standard 12-month residential lease agreement.',
    },
    {
      leaseNumber: 'LSE-2026-0002',
      tenant: tenant2._id,
      property: properties[0]._id,
      unit: units[1]._id,
      startDate: oneYearAgo,
      endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // Expiring in 18 days
      monthlyRent: 3100,
      securityDeposit: 3100,
      status: 'active',
      paymentDueDay: 5,
      terms: 'Standard 12-month residential lease agreement.',
    },
    {
      leaseNumber: 'LSE-2026-0003',
      tenant: tenant3._id,
      property: properties[2]._id,
      unit: units[4]._id,
      startDate: oneYearAgo,
      endDate: sixMonthsFuture,
      monthlyRent: 2800,
      securityDeposit: 2800,
      status: 'active',
      paymentDueDay: 1,
      terms: 'Brownstone historical lease agreement.',
    },
  ];

  const leases = [];
  for (const l of leasesData) {
    const lease = await Lease.create(l);
    leases.push(lease);
  }

  // 5. Create Payments
  await Payment.create([
    {
      paymentNumber: 'PAY-202611-0001',
      lease: leases[0]._id,
      tenant: tenant1._id,
      property: properties[0]._id,
      unit: units[0]._id,
      amount: 2200,
      paymentDate: new Date(),
      dueDate: new Date(),
      paymentMethod: 'bank_transfer',
      status: 'completed',
      receiptNumber: 'REC-202611-0001',
      transactionId: 'TXN-984321',
      notes: 'November 2026 rent payment received in full.',
      recordedBy: manager1._id,
    },
    {
      paymentNumber: 'PAY-202611-0002',
      lease: leases[1]._id,
      tenant: tenant2._id,
      property: properties[0]._id,
      unit: units[1]._id,
      amount: 3100,
      paymentDate: new Date(),
      dueDate: new Date(),
      paymentMethod: 'credit_card',
      status: 'completed',
      receiptNumber: 'REC-202611-0002',
      transactionId: 'TXN-984322',
      notes: 'November 2026 rent payment via Visa card.',
      recordedBy: manager1._id,
    },
    {
      paymentNumber: 'PAY-202611-0003',
      lease: leases[2]._id,
      tenant: tenant3._id,
      property: properties[2]._id,
      unit: units[4]._id,
      amount: 2800,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paymentMethod: 'bank_transfer',
      status: 'pending',
      notes: 'Pending tenant bank authorization.',
      recordedBy: manager2._id,
    },
  ]);

  // 6. Create Maintenance Requests
  await MaintenanceRequest.create([
    {
      tenant: tenant1._id,
      property: properties[0]._id,
      unit: units[0]._id,
      title: 'Bathroom sink drain draining slowly',
      description: 'The master bathroom sink is draining very slowly and backing up during usage.',
      category: 'plumbing',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: manager1._id,
      estimatedCost: 150,
      actualCost: 0,
      images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'],
    },
    {
      tenant: tenant2._id,
      property: properties[0]._id,
      unit: units[1]._id,
      title: 'AC cooling unit blowing warm air',
      description: 'Living room AC unit is not cooling and blowing lukewarm air.',
      category: 'hvac',
      priority: 'high',
      status: 'pending',
      assignedTo: manager1._id,
      estimatedCost: 300,
      actualCost: 0,
    },
    {
      tenant: tenant3._id,
      property: properties[2]._id,
      unit: units[4]._id,
      title: 'Kitchen recessed lighting flickering',
      description: 'Two LED recessed lights in the kitchen ceiling are flickering intermittently.',
      category: 'electrical',
      priority: 'low',
      status: 'resolved',
      assignedTo: manager2._id,
      estimatedCost: 80,
      actualCost: 75,
      resolution: 'Replaced faulty LED dimmer transformer switch.',
      resolvedDate: new Date(),
    },
  ]);

  // 7. Activity Logs
  await ActivityLog.create([
    {
      user: admin._id,
      action: 'system_seed',
      resourceType: 'System',
      details: 'Initial database seeding executed successfully with realistic records.',
      ipAddress: '127.0.0.1',
    },
    {
      user: owner1._id,
      action: 'create',
      resourceType: 'Property',
      resourceId: properties[0]._id,
      details: 'Added Grand Horizon Luxury Residences to system portfolio.',
      ipAddress: '127.0.0.1',
    },
    {
      user: manager1._id,
      action: 'issue_lease',
      resourceType: 'Lease',
      details: 'Issued residential lease agreement for Unit 101 to David Miller.',
      ipAddress: '127.0.0.1',
    },
    {
      user: tenant1._id,
      action: 'payment_submitted',
      resourceType: 'Payment',
      details: 'Submitted monthly rent payment via ACH Bank Transfer ($2,200.00).',
      ipAddress: '127.0.0.1',
    },
    {
      user: tenant2._id,
      action: 'maintenance_requested',
      resourceType: 'MaintenanceRequest',
      details: 'Submitted high-priority HVAC maintenance ticket for Unit 202.',
      ipAddress: '127.0.0.1',
    },
  ]);

  console.log('✅ Database successfully initialized and seeded!');
};

module.exports = { seedData };

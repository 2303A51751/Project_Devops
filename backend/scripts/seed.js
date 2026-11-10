const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Property = require('../models/Property');
const Unit = require('../models/Unit');
const RentalApplication = require('../models/RentalApplication');
const Lease = require('../models/Lease');
const Payment = require('../models/Payment');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/property_rental';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding.');

    // Clear existing data
    console.log('Clearing existing collections...');
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
    console.log('Collections cleared.');

    // 1. Create Users
    console.log('Creating users...');
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
        address: '742 Evergreen Terrace, Springfield, OR 97477',
      },
      {
        name: 'Marcus Brody (Manager)',
        email: 'manager1@test.com',
        password: 'manager123',
        role: 'manager',
        phone: '+1-555-0103',
        address: '88 Hudson St, Jersey City, NJ 07302',
      },
      {
        name: 'Elena Rostova (Manager)',
        email: 'manager2@test.com',
        password: 'manager123',
        role: 'manager',
        phone: '+1-555-0104',
        address: '42 Wallaby Way, Austin, TX 78701',
      },
      {
        name: 'David Miller',
        email: 'tenant1@test.com',
        password: 'tenant123',
        role: 'tenant',
        phone: '+1-555-0201',
        address: '12 Oak Lane, Apt 1A, Boston, MA 02108',
      },
      {
        name: 'Emily Watson',
        email: 'tenant2@test.com',
        password: 'tenant123',
        role: 'tenant',
        phone: '+1-555-0202',
        address: '34 Maple Blvd, Chicago, IL 60601',
      },
      {
        name: 'Michael Chang',
        email: 'tenant3@test.com',
        password: 'tenant123',
        role: 'tenant',
        phone: '+1-555-0203',
        address: '56 Pine Road, Seattle, WA 98101',
      },
      {
        name: 'Jessica Taylor',
        email: 'tenant4@test.com',
        password: 'tenant123',
        role: 'tenant',
        phone: '+1-555-0204',
        address: '78 Elm Street, Denver, CO 80202',
      },
      {
        name: 'James Wilson',
        email: 'tenant5@test.com',
        password: 'tenant123',
        role: 'tenant',
        phone: '+1-555-0205',
        address: '90 Cedar Ave, Miami, FL 33101',
      },
    ];

    const users = await User.create(usersData);
    const admin = users[0];
    const owner1 = users[1];
    const owner2 = users[2];
    const manager1 = users[3];
    const manager2 = users[4];
    const tenants = [users[5], users[6], users[7], users[8], users[9]];
    console.log(`Created ${users.length} users.`);

    // 2. Create 8 Properties
    console.log('Creating properties...');
    const propertiesData = [
      {
        title: 'Grand Horizon Luxury Residences',
        description: 'Modern luxury residential apartments with panoramic city skyline views, 24/7 concierge, state-of-the-art fitness center, and heated infinity rooftop pool.',
        address: { street: '450 Lexington Ave', city: 'New York', state: 'NY', zipCode: '10017', country: 'USA' },
        type: 'apartment',
        owner: owner1._id,
        manager: manager1._id,
        amenities: ['Elevator', 'Fitness Center', 'Rooftop Pool', 'Concierge', 'Underground Parking', 'Smart Lock'],
        totalUnits: 3,
        status: 'active',
        yearBuilt: 2021,
        parkingSpaces: 50,
        petPolicy: 'allowed',
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Silverstone Waterfront Condominiums',
        description: 'Prime waterfront living featuring private boat slips, oversized balconies, floor-to-ceiling glass windows, and private dock access.',
        address: { street: '1200 Ocean Breeze Dr', city: 'Miami', state: 'FL', zipCode: '33139', country: 'USA' },
        type: 'condo',
        owner: owner1._id,
        manager: manager1._id,
        amenities: ['Waterfront', 'Balcony', 'Swimming Pool', 'Security Guard', 'Covered Parking', 'Gym'],
        totalUnits: 3,
        status: 'active',
        yearBuilt: 2019,
        parkingSpaces: 40,
        petPolicy: 'allowed',
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Oakwood Victorian Townhomes',
        description: 'Charming historic brick facade townhomes meticulously restored with chef kitchens, hardwood floors, and serene private gardens.',
        address: { street: '78 Commonwealth Ave', city: 'Boston', state: 'MA', zipCode: '02116', country: 'USA' },
        type: 'townhouse',
        owner: owner1._id,
        manager: manager1._id,
        amenities: ['Private Garden', 'Fireplace', 'Hardwood Floors', 'In-unit Laundry', 'Wine Cellar'],
        totalUnits: 3,
        status: 'active',
        yearBuilt: 1910,
        parkingSpaces: 6,
        petPolicy: 'cats_only',
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'The Continental Lofts & Commercial',
        description: 'High-density mixed residential and boutique commercial complex situated in the heart of the thriving technology corridor.',
        address: { street: '500 Tech Parkway', city: 'Austin', state: 'TX', zipCode: '78701', country: 'USA' },
        type: 'commercial',
        owner: owner1._id,
        manager: manager2._id,
        amenities: ['High-speed Fiber', 'Conference Rooms', 'Loading Bay', 'EV Charging', '24/7 Access'],
        totalUnits: 3,
        status: 'active',
        yearBuilt: 2022,
        parkingSpaces: 80,
        petPolicy: 'not_allowed',
        images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Pinecrest Suburban Family Estates',
        description: 'Spacious detached family residences with sprawling fenced yards, two-car garages, and access to top-rated school districts.',
        address: { street: '310 Whispering Pines Way', city: 'Denver', state: 'CO', zipCode: '80203', country: 'USA' },
        type: 'house',
        owner: owner2._id,
        manager: manager2._id,
        amenities: ['Fenced Yard', '2-Car Garage', 'Fireplace', 'Basement Storage', 'Central HVAC'],
        totalUnits: 3,
        status: 'active',
        yearBuilt: 2018,
        parkingSpaces: 6,
        petPolicy: 'allowed',
        images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Emerald Bay Modern Heights',
        description: 'Sleek eco-conscious high-rise living with solar arrays, low-flow fixtures, rooftop community gardens, and EV parking.',
        address: { street: '820 4th Avenue', city: 'Seattle', state: 'WA', zipCode: '98104', country: 'USA' },
        type: 'apartment',
        owner: owner2._id,
        manager: manager2._id,
        amenities: ['Green Building', 'Bike Storage', 'Rooftop Garden', 'Pet Spa', 'Co-working Lounge'],
        totalUnits: 3,
        status: 'active',
        yearBuilt: 2023,
        parkingSpaces: 45,
        petPolicy: 'allowed',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Highland Park Urban Lofts',
        description: 'Converted industrial loft apartments with exposed ductwork, brick accents, soaring 16ft ceilings, and expansive industrial sash windows.',
        address: { street: '915 N Michigan Ave', city: 'Chicago', state: 'IL', zipCode: '60611', country: 'USA' },
        type: 'apartment',
        owner: owner2._id,
        manager: manager1._id,
        amenities: ['Freight Elevator', 'Exposed Brick', 'Soaking Tubs', 'High Ceilings', 'Package Lockers'],
        totalUnits: 3,
        status: 'active',
        yearBuilt: 2016,
        parkingSpaces: 30,
        petPolicy: 'allowed',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Sunset Vista Mediterranean Villa',
        description: 'Stunning Spanish-revival villa featuring courtyard fountains, terracotta tile roofing, archways, and private citrus groves.',
        address: { street: '1450 Canyon Creek Rd', city: 'Austin', state: 'TX', zipCode: '78746', country: 'USA' },
        type: 'house',
        owner: owner2._id,
        manager: manager2._id,
        amenities: ['Courtyard Fountain', 'Swimming Pool', 'Outdoor Kitchen', 'Wine Cellar', 'Gated Entry'],
        totalUnits: 3,
        status: 'active',
        yearBuilt: 2017,
        parkingSpaces: 4,
        petPolicy: 'allowed',
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'],
      },
    ];

    const properties = await Property.create(propertiesData);
    console.log(`Created ${properties.length} properties.`);

    // 3. Create 24 Rental Units across the 8 properties (3 units per property)
    console.log('Creating rental units...');
    const unitsData = [];
    const unitConfigs = [
      { unitNumber: '101', floor: 1, bedrooms: 1, bathrooms: 1, area: 750, rent: 1800, deposit: 1800 },
      { unitNumber: '202', floor: 2, bedrooms: 2, bathrooms: 2, area: 1100, rent: 2600, deposit: 2600 },
      { unitNumber: '303', floor: 3, bedrooms: 3, bathrooms: 2.5, area: 1650, rent: 3800, deposit: 3800 },
    ];

    properties.forEach((prop, pIdx) => {
      unitConfigs.forEach((cfg, uIdx) => {
        // Assign some tenants to units
        let currentTenant = null;
        let status = 'available';

        if (pIdx === 0 && uIdx === 0) {
          currentTenant = tenants[0]._id;
          status = 'occupied';
        } else if (pIdx === 0 && uIdx === 1) {
          currentTenant = tenants[1]._id;
          status = 'occupied';
        } else if (pIdx === 1 && uIdx === 0) {
          currentTenant = tenants[2]._id;
          status = 'occupied';
        } else if (pIdx === 2 && uIdx === 0) {
          currentTenant = tenants[3]._id;
          status = 'occupied';
        } else if (pIdx === 4 && uIdx === 0) {
          currentTenant = tenants[4]._id;
          status = 'occupied';
        } else if (pIdx === 3 && uIdx === 0) {
          status = 'maintenance';
        } else if (pIdx === 5 && uIdx === 2) {
          status = 'reserved';
        }

        unitsData.push({
          property: prop._id,
          unitNumber: `${cfg.unitNumber}`,
          floor: cfg.floor,
          bedrooms: cfg.bedrooms,
          bathrooms: cfg.bathrooms,
          area: cfg.area,
          monthlyRent: cfg.rent + pIdx * 100,
          securityDeposit: cfg.deposit + pIdx * 100,
          status,
          currentTenant,
          amenities: ['Stainless Steel Appliances', 'In-Unit Washer/Dryer', 'Hardwood Flooring', 'Central AC'],
          description: `Spacious ${cfg.bedrooms}BR/${cfg.bathrooms}BA unit featuring upgraded contemporary finishes and abundance of natural lighting.`,
        });
      });
    });

    const units = await Unit.create(unitsData);
    console.log(`Created ${units.length} units.`);

    // 4. Create Leases (Active and Expired)
    console.log('Creating leases...');
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twentyDaysFromNow = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
    const fortyFiveDaysFromNow = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
    const sixMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());

    const occupiedUnits = units.filter((u) => u.status === 'occupied');

    const leasesData = [
      {
        tenant: tenants[0]._id,
        unit: occupiedUnits[0]._id,
        property: occupiedUnits[0].property,
        startDate: sixMonthsAgo,
        endDate: sixMonthsFromNow,
        monthlyRent: occupiedUnits[0].monthlyRent,
        securityDeposit: occupiedUnits[0].securityDeposit,
        status: 'active',
        terms: 'Standard 12-month residential lease. No smoking allowed indoors.',
        createdBy: owner1._id,
      },
      {
        tenant: tenants[1]._id,
        unit: occupiedUnits[1]._id,
        property: occupiedUnits[1].property,
        startDate: oneYearAgo,
        endDate: twentyDaysFromNow, // Expiring in 20 days (< 30 days)
        monthlyRent: occupiedUnits[1].monthlyRent,
        securityDeposit: occupiedUnits[1].securityDeposit,
        status: 'active',
        terms: 'Residential lease with priority renewal terms.',
        createdBy: owner1._id,
      },
      {
        tenant: tenants[2]._id,
        unit: occupiedUnits[2]._id,
        property: occupiedUnits[2].property,
        startDate: oneYearAgo,
        endDate: fortyFiveDaysFromNow, // Expiring in 45 days (< 60 days)
        monthlyRent: occupiedUnits[2].monthlyRent,
        securityDeposit: occupiedUnits[2].securityDeposit,
        status: 'active',
        terms: 'Waterfront unit lease including marina slip access.',
        createdBy: owner1._id,
      },
      {
        tenant: tenants[3]._id,
        unit: occupiedUnits[3]._id,
        property: occupiedUnits[3].property,
        startDate: sixMonthsAgo,
        endDate: sixMonthsFromNow,
        monthlyRent: occupiedUnits[3].monthlyRent,
        securityDeposit: occupiedUnits[3].securityDeposit,
        status: 'active',
        terms: 'Townhome lease with private garden maintenance obligations.',
        createdBy: owner1._id,
      },
      {
        tenant: tenants[4]._id,
        unit: occupiedUnits[4]._id,
        property: occupiedUnits[4].property,
        startDate: sixMonthsAgo,
        endDate: sixMonthsFromNow,
        monthlyRent: occupiedUnits[4].monthlyRent,
        securityDeposit: occupiedUnits[4].securityDeposit,
        status: 'active',
        terms: 'Single family home suburban lease.',
        createdBy: owner2._id,
      },
      // Expired Lease
      {
        tenant: tenants[0]._id,
        unit: units[3]._id,
        property: units[3].property,
        startDate: new Date(now.getFullYear() - 2, 0, 1),
        endDate: oneMonthAgo,
        monthlyRent: 2000,
        securityDeposit: 2000,
        depositStatus: 'returned',
        status: 'expired',
        terms: 'Previous concluded term.',
        createdBy: owner1._id,
      },
    ];

    const leases = await Lease.create(leasesData);
    console.log(`Created ${leases.length} leases.`);

    // 5. Create Rental Applications
    console.log('Creating rental applications...');
    const availableUnits = units.filter((u) => u.status === 'available');
    const applicationsData = [
      {
        tenant: tenants[2]._id,
        unit: availableUnits[0]._id,
        property: availableUnits[0].property,
        status: 'pending',
        moveInDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        employmentInfo: { employer: 'Apex Tech Inc', position: 'Senior Engineer', monthlyIncome: 9500 },
        previousAddress: '400 Elm St, Boston, MA',
        message: 'Looking forward to moving into this unit! Excellent credit score.',
        references: [{ name: 'Sarah Connor', phone: '+1-555-8888', relationship: 'Colleague' }],
      },
      {
        tenant: tenants[3]._id,
        unit: availableUnits[1]._id,
        property: availableUnits[1].property,
        status: 'approved',
        moveInDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        employmentInfo: { employer: 'Metro Hospital', position: 'Clinical Specialist', monthlyIncome: 8200 },
        previousAddress: '120 Broad St, Miami, FL',
        message: 'Non-smoker, quiet professional with clean background.',
        reviewedBy: owner1._id,
        reviewDate: new Date(),
        reviewNotes: 'Verified income and background check clear.',
      },
      {
        tenant: tenants[4]._id,
        unit: availableUnits[2]._id,
        property: availableUnits[2].property,
        status: 'rejected',
        moveInDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        employmentInfo: { employer: 'Self Employed', position: 'Consultant', monthlyIncome: 3000 },
        previousAddress: '88 Oak Ave, Austin, TX',
        message: 'Interested in this property for immediate move in.',
        reviewedBy: manager2._id,
        reviewDate: new Date(),
        reviewNotes: 'Income did not meet the 3x rent threshold.',
      },
    ];

    const applications = await RentalApplication.create(applicationsData);
    console.log(`Created ${applications.length} applications.`);

    // 6. Create Payments
    console.log('Creating payment records...');
    const paymentsData = [];

    // Monthly payments for active leases over past 4 months
    leases.filter((l) => l.status === 'active').forEach((lease, lIdx) => {
      for (let m = 3; m >= 0; m--) {
        const payDate = new Date(now.getFullYear(), now.getMonth() - m, 5);
        const dueDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const isCurrentMonth = m === 0;

        let status = 'completed';
        if (isCurrentMonth && lIdx === 1) {
          status = 'pending'; // Tenant 2 pending for this month
        }

        paymentsData.push({
          lease: lease._id,
          tenant: lease.tenant,
          property: lease.property,
          unit: lease.unit,
          amount: lease.monthlyRent,
          paymentDate: status === 'completed' ? payDate : null,
          dueDate,
          paymentMethod: ['bank_transfer', 'online', 'check'][lIdx % 3],
          status,
          transactionId: status === 'completed' ? `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}` : null,
          receiptNumber: `REC-${now.getFullYear()}${String(now.getMonth() - m + 1).padStart(2, '0')}-${String(lIdx + 1).padStart(4, '0')}`,
          notes: `Rent payment for ${dueDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          recordedBy: owner1._id,
        });
      }
    });

    const payments = await Payment.create(paymentsData);
    console.log(`Created ${payments.length} payment records.`);

    // 7. Create Maintenance Requests
    console.log('Creating maintenance requests...');
    const requestsData = [
      {
        tenant: tenants[0]._id,
        property: occupiedUnits[0].property,
        unit: occupiedUnits[0]._id,
        title: 'Master Bathroom Sink Leaking',
        description: 'Persistent dripping underneath the master bathroom vanity. Small puddle forming in cabinet.',
        category: 'plumbing',
        priority: 'high',
        status: 'in_progress',
        assignedTo: manager1._id,
        estimatedCost: 180,
      },
      {
        tenant: tenants[1]._id,
        property: occupiedUnits[1].property,
        unit: occupiedUnits[1]._id,
        title: 'HVAC Unit Not Blowing Cold Air',
        description: 'The central thermostat is set to 70F but temperature stays at 78F. Fan runs continuously.',
        category: 'hvac',
        priority: 'high',
        status: 'pending',
        assignedTo: manager1._id,
        estimatedCost: 350,
      },
      {
        tenant: tenants[2]._id,
        property: occupiedUnits[2].property,
        unit: occupiedUnits[2]._id,
        title: 'Refrigerator Ice Maker Jammed',
        description: 'Ice dispenser makes grinding noise and does not dispense cubes.',
        category: 'appliance',
        priority: 'medium',
        status: 'resolved',
        assignedTo: manager1._id,
        resolution: 'Cleared ice blockage and replaced solenoid inlet valve.',
        resolvedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        estimatedCost: 150,
        actualCost: 140,
      },
      {
        tenant: tenants[3]._id,
        property: occupiedUnits[3].property,
        unit: occupiedUnits[3]._id,
        title: 'Balcony Door Latch Stuck',
        description: 'Sliding glass door lock mechanism is stiff and hard to latch securely.',
        category: 'structural',
        priority: 'low',
        status: 'pending',
        assignedTo: manager2._id,
        estimatedCost: 80,
      },
      {
        tenant: tenants[4]._id,
        property: occupiedUnits[4].property,
        unit: occupiedUnits[4]._id,
        title: 'Kitchen GFCI Outlet Tripping',
        description: 'Backsplash GFCI outlet immediately trips when kettle or toaster is plugged in.',
        category: 'electrical',
        priority: 'medium',
        status: 'in_progress',
        assignedTo: manager2._id,
        estimatedCost: 120,
      },
    ];

    const requests = await MaintenanceRequest.create(requestsData);
    console.log(`Created ${requests.length} maintenance requests.`);

    // 8. Notifications & Activity Logs
    console.log('Creating notifications & activity logs...');
    await Notification.create([
      {
        user: tenants[0]._id,
        title: 'Payment Confirmed',
        message: 'Your rent payment of $1,800 has been recorded successfully.',
        type: 'success',
      },
      {
        user: tenants[1]._id,
        title: 'Lease Expiration Notice',
        message: 'Your current lease expires in 20 days. Please review renewal options.',
        type: 'warning',
      },
      {
        user: owner1._id,
        title: 'New Maintenance Request',
        message: 'High priority plumbing ticket submitted for Grand Horizon #101.',
        type: 'info',
      },
      {
        user: manager1._id,
        title: 'New Application Received',
        message: 'Michael Chang submitted a rental application for review.',
        type: 'info',
      },
    ]);

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
        details: 'Issued residential lease agreement for Unit 101 to Michael Chen.',
        ipAddress: '127.0.0.1',
      },
      {
        user: tenant1._id,
        action: 'payment_submitted',
        resourceType: 'Payment',
        details: 'Submitted monthly rent payment via ACH Bank Transfer ($2,400.00).',
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

    console.log('=============================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!   ');
    console.log('=============================================');
    console.log('Demo Credentials:');
    console.log(' Admin:    admin@propertymanager.com / admin123');
    console.log(' Owner 1:  owner1@test.com / owner123');
    console.log(' Owner 2:  owner2@test.com / owner123');
    console.log(' Manager 1:manager1@test.com / manager123');
    console.log(' Manager 2:manager2@test.com / manager123');
    console.log(' Tenant 1: tenant1@test.com / tenant123');
    console.log(' Tenant 2: tenant2@test.com / tenant123');
    console.log(' Tenant 3: tenant3@test.com / tenant123');
    console.log('=============================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();

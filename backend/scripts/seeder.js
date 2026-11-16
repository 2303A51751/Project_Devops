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
  console.log('📦 Seeding database collections with 55 users and full enterprise datasets...');

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

  // 1. Create Users (55 Users Total: 4 Admins, 10 Owners, 8 Managers, 33 Tenants)
  const usersData = [
    // --- 4 Admins ---
    {
      name: 'System Administrator',
      email: 'admin@propertymanager.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-555-0100',
      address: '100 Admin Plaza, Suite 400, New York, NY 10001',
    },
    {
      name: 'Jessica Taylor (Admin)',
      email: 'admin2@propertymanager.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-555-0201',
      address: '120 Executive Blvd, Suite 500, Chicago, IL 60601',
    },
    {
      name: 'Marcus Vance (Admin)',
      email: 'admin3@propertymanager.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-555-0202',
      address: '500 Tech Parkway, Suite 800, Austin, TX 78701',
    },
    {
      name: 'Victoria Sterling (Admin)',
      email: 'admin4@propertymanager.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-555-0203',
      address: '300 Financial Center, Boston, MA 02110',
    },

    // --- 10 Owners ---
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
      name: 'Michael Chang (Owner)',
      email: 'owner3@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0204',
      address: '742 Evergreen Terrace, Seattle, WA 98101',
    },
    {
      name: 'Sophia Rodriguez (Owner)',
      email: 'owner4@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0205',
      address: '88 Ocean Drive, Suite 12B, Miami, FL 33139',
    },
    {
      name: 'David Kim (Owner)',
      email: 'owner5@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0206',
      address: '101 Silicon Valley Way, San Jose, CA 95113',
    },
    {
      name: 'Amanda Foster (Owner)',
      email: 'owner6@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0207',
      address: '450 Peachtree Street NE, Atlanta, GA 30308',
    },
    {
      name: 'Harrison Ford (Owner)',
      email: 'owner7@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0208',
      address: '90210 Beverly Blvd, Los Angeles, CA 90210',
    },
    {
      name: 'Beatrice Sinclair (Owner)',
      email: 'owner8@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0209',
      address: '1440 Lake Shore Drive, Chicago, IL 60610',
    },
    {
      name: 'Arthur Pendelton (Owner)',
      email: 'owner9@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0210',
      address: '1600 Pennsylvania Ave NW, Washington, DC 20006',
    },
    {
      name: 'Eleanor Campbell (Owner)',
      email: 'owner10@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0211',
      address: '750 Larimer Street, Denver, CO 80202',
    },

    // --- 8 Managers ---
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
      name: 'Brian Clark (Manager)',
      email: 'manager3@test.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1-555-0212',
      address: '300 Michigan Ave, Unit 8, Chicago, IL 60611',
    },
    {
      name: 'Rachel Green (Manager)',
      email: 'manager4@test.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1-555-0213',
      address: '19 Greenwich Village, New York, NY 10014',
    },
    {
      name: 'Daniel Martinez (Manager)',
      email: 'manager5@test.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1-555-0214',
      address: '600 Congress Ave, Austin, TX 78701',
    },
    {
      name: 'Kimberly Adams (Manager)',
      email: 'manager6@test.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1-555-0215',
      address: '2200 Westlake Ave, Seattle, WA 98121',
    },
    {
      name: 'Nathan Drake (Manager)',
      email: 'manager7@test.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1-555-0216',
      address: '400 Biscayne Blvd, Miami, FL 33132',
    },
    {
      name: 'Chloe Sullivan (Manager)',
      email: 'manager8@test.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1-555-0217',
      address: '555 Market Street, San Francisco, CA 94105',
    },

    // --- 33 Tenants ---
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
    {
      name: 'Lucas Scott (Tenant)',
      email: 'tenant6@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0218',
      address: 'Apt 301, Riverfront Residences, Chicago, IL 60606',
    },
    {
      name: 'Olivia Brown (Tenant)',
      email: 'tenant7@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0219',
      address: 'Unit 14B, Skyline Tower, Seattle, WA 98104',
    },
    {
      name: 'James Wilson (Tenant)',
      email: 'tenant8@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0220',
      address: 'Suite 204, Highline Apartments, New York, NY 10011',
    },
    {
      name: 'Mia Davis (Tenant)',
      email: 'tenant9@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0221',
      address: 'Apt 12, Sunny Isles Court, Miami, FL 33160',
    },
    {
      name: 'Benjamin Miller (Tenant)',
      email: 'tenant10@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0222',
      address: 'Townhouse 3, Oakwood Estates, Austin, TX 78703',
    },
    {
      name: 'Charlotte Taylor (Tenant)',
      email: 'tenant11@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0223',
      address: 'Unit 502, Bayview Lofts, San Francisco, CA 94107',
    },
    {
      name: 'Alexander Lee (Tenant)',
      email: 'tenant12@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0224',
      address: 'Apt 4B, Maple Grove, Denver, CO 80202',
    },
    {
      name: 'Harper White (Tenant)',
      email: 'tenant13@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0225',
      address: 'Unit 108, Pine Crest Villas, Portland, OR 97201',
    },
    {
      name: 'Elijah Harris (Tenant)',
      email: 'tenant14@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0226',
      address: 'Apt 6C, Magnolia Gardens, Atlanta, GA 30309',
    },
    {
      name: 'Amelia Martin (Tenant)',
      email: 'tenant15@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0227',
      address: 'Studio 18, Midtown Lofts, Houston, TX 77002',
    },
    {
      name: 'William Anderson (Tenant)',
      email: 'tenant16@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0228',
      address: 'Apt 201, Harbor Point, Boston, MA 02125',
    },
    {
      name: 'Evelyn Thomas (Tenant)',
      email: 'tenant17@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0229',
      address: 'Unit 310, Sunset Ridge, Phoenix, AZ 85004',
    },
    {
      name: 'Noah Richardson (Tenant)',
      email: 'tenant18@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0230',
      address: '410 Grand Ave, Unit 3B, New York, NY 10002',
    },
    {
      name: 'Isabella Murphy (Tenant)',
      email: 'tenant19@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0231',
      address: '88 Ocean Way, Unit 201, Miami, FL 33139',
    },
    {
      name: 'Mason Cooper (Tenant)',
      email: 'tenant20@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0232',
      address: '15 Beacon Street, Unit 4A, Boston, MA 02108',
    },
    {
      name: 'Ava Brooks (Tenant)',
      email: 'tenant21@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0233',
      address: '77 Montgomery St, San Francisco, CA 94104',
    },
    {
      name: 'Logan Bailey (Tenant)',
      email: 'tenant22@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0234',
      address: '120 Piedmont Ave NE, Atlanta, GA 30303',
    },
    {
      name: 'Grace Ramirez (Tenant)',
      email: 'tenant23@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0235',
      address: '400 Lavaca St, Austin, TX 78701',
    },
    {
      name: 'Henry Cox (Tenant)',
      email: 'tenant24@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0236',
      address: '1900 5th Ave, Seattle, WA 98101',
    },
    {
      name: 'Chloe Ward (Tenant)',
      email: 'tenant25@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0237',
      address: '1700 California St, Denver, CO 80202',
    },
    {
      name: 'Samuel Peterson (Tenant)',
      email: 'tenant26@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0238',
      address: '220 W 57th St, New York, NY 10019',
    },
    {
      name: 'Zoe Morris (Tenant)',
      email: 'tenant27@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0239',
      address: '105 Collins Ave, Miami, FL 33139',
    },
    {
      name: 'Jackson Rogers (Tenant)',
      email: 'tenant28@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0240',
      address: '60 Commonwealth Ave, Boston, MA 02116',
    },
    {
      name: 'Lily Reed (Tenant)',
      email: 'tenant29@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0241',
      address: '333 Bush St, San Francisco, CA 94104',
    },
    {
      name: 'Sebastian Kelly (Tenant)',
      email: 'tenant30@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0242',
      address: '999 Peachtree St NE, Atlanta, GA 30309',
    },
    {
      name: 'Hannah Howard (Tenant)',
      email: 'tenant31@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0243',
      address: '200 E 6th St, Austin, TX 78701',
    },
    {
      name: 'Gabriel Simmons (Tenant)',
      email: 'tenant32@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0244',
      address: '1201 3rd Ave, Seattle, WA 98101',
    },
    {
      name: 'Penelope Foster (Tenant)',
      email: 'tenant33@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0245',
      address: '1801 16th St, Denver, CO 80202',
    },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await User.create(u);
    createdUsers.push(user);
  }

  const admins = createdUsers.filter((u) => u.role === 'admin');
  const owners = createdUsers.filter((u) => u.role === 'owner');
  const managers = createdUsers.filter((u) => u.role === 'manager');
  const tenants = createdUsers.filter((u) => u.role === 'tenant');

  // 2. Create Properties (8 Properties)
  const propertiesData = [
    {
      title: 'Grand Horizon Luxury Residences',
      description: 'Ultra-modern luxury apartment complex with panoramic skyline views, 24/7 concierge, rooftop pool, and fitness center.',
      address: { street: '450 West 42nd Street', city: 'New York', state: 'NY', zipCode: '10036', country: 'USA' },
      type: 'apartment',
      owner: owners[0]._id,
      manager: managers[0]._id,
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
      amenities: ['Gym', 'Pool', 'Concierge', 'Rooftop Deck', 'Parking', 'Elevator', 'Pet Friendly'],
      totalUnits: 5,
      yearBuilt: 2021,
      parkingSpaces: 40,
    },
    {
      title: 'Silverstone Waterfront Condominiums',
      description: 'Premier coastal residential towers situated directly on the South Beach shoreline with private dock access and spa.',
      address: { street: '100 Ocean Drive', city: 'Miami', state: 'FL', zipCode: '33139', country: 'USA' },
      type: 'condo',
      owner: owners[1]._id,
      manager: managers[1]._id,
      images: ['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800'],
      amenities: ['Waterfront', 'Private Beach', 'Spa', 'Valet Parking', 'Tennis Court'],
      totalUnits: 5,
      yearBuilt: 2019,
      parkingSpaces: 30,
    },
    {
      title: 'Beacon Hill Historic Brownstones',
      description: 'Meticulously preserved 19th-century brownstone townhomes offering classic architectural charm coupled with modern interior finishes.',
      address: { street: '72 Mount Vernon Street', city: 'Boston', state: 'MA', zipCode: '02108', country: 'USA' },
      type: 'townhouse',
      owner: owners[2]._id,
      manager: managers[1]._id,
      images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800'],
      amenities: ['Fireplace', 'Hardwood Floors', 'Private Garden', 'Wine Cellar'],
      totalUnits: 5,
      yearBuilt: 1910,
      parkingSpaces: 10,
    },
    {
      title: 'Pacific Heights Executive Suites',
      description: 'Sophisticated modern high-rise in upscale San Francisco featuring smart home automations, floor-to-ceiling glass, and wine cellar.',
      address: { street: '2100 California Street', city: 'San Francisco', state: 'CA', zipCode: '94115', country: 'USA' },
      type: 'apartment',
      owner: owners[3]._id,
      manager: managers[2]._id,
      images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'],
      amenities: ['Smart Home', 'Doorman', 'EV Charging', 'Sky Lounge'],
      totalUnits: 5,
      yearBuilt: 2022,
      parkingSpaces: 25,
    },
    {
      title: 'Magnolia Midtown Parkside Residences',
      description: 'Garden-style community adjacent to Piedmont Park offering direct greenway access, saltwater pool, and resident coworking hub.',
      address: { street: '855 Peachtree Street NE', city: 'Atlanta', state: 'GA', zipCode: '30308', country: 'USA' },
      type: 'apartment',
      owner: owners[4]._id,
      manager: managers[3]._id,
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
      amenities: ['Dog Park', 'Saltwater Pool', 'Coworking Hub', 'Clubhouse'],
      totalUnits: 5,
      yearBuilt: 2020,
      parkingSpaces: 35,
    },
    {
      title: 'Austin Riverwalk Modern Lofts',
      description: 'Industrial-chic loft apartments along Lady Bird Lake with 14-foot exposed concrete ceilings and floor-to-ceiling glass balconies.',
      address: { street: '300 Colorado Street', city: 'Austin', state: 'TX', zipCode: '78701', country: 'USA' },
      type: 'condo',
      owner: owners[5]._id,
      manager: managers[4]._id,
      images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
      amenities: ['Kayak Launch', 'Rooftop Infinity Pool', 'Bicycle Storage', 'Fitness Center'],
      totalUnits: 5,
      yearBuilt: 2023,
      parkingSpaces: 20,
    },
    {
      title: 'Emerald Bay Marina Residences',
      description: 'Waterfront luxury community in Seattle with private marina slips, heated indoor pool, and panoramic Puget Sound views.',
      address: { street: '1200 Alaskan Way', city: 'Seattle', state: 'WA', zipCode: '98101', country: 'USA' },
      type: 'apartment',
      owner: owners[6]._id,
      manager: managers[5]._id,
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
      amenities: ['Marina Access', 'Heated Pool', 'Sauna', 'Valet Parking'],
      totalUnits: 5,
      yearBuilt: 2022,
      parkingSpaces: 30,
    },
    {
      title: 'Rocky Mountain Alpine Towers',
      description: 'Ski-country alpine lodge architecture with contemporary smart home integrations in the heart of downtown Denver.',
      address: { street: '1600 Glenarm Place', city: 'Denver', state: 'CO', zipCode: '80202', country: 'USA' },
      type: 'condo',
      owner: owners[7]._id,
      manager: managers[6]._id,
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
      amenities: ['Ski Storage', 'Fire Pit', 'Spa', 'Fitness Club'],
      totalUnits: 5,
      yearBuilt: 2021,
      parkingSpaces: 28,
    },
  ];

  const properties = [];
  for (const p of propertiesData) {
    const prop = await Property.create(p);
    properties.push(prop);
  }

  // 3. Create Units (40 Units Total: 5 per property)
  const unitsData = [];
  const unitNumbers = ['101', '102', '201', '202', '301'];
  for (let pIdx = 0; pIdx < properties.length; pIdx++) {
    for (let uIdx = 0; uIdx < unitNumbers.length; uIdx++) {
      const uNum = unitNumbers[uIdx];
      const floor = parseInt(uNum.charAt(0), 10);
      const isOccupied = uIdx < 4;
      const assignedTenant = isOccupied ? tenants[(pIdx * 4 + uIdx) % tenants.length] : null;

      unitsData.push({
        property: properties[pIdx]._id,
        unitNumber: `${uNum}`,
        floor,
        bedrooms: (uIdx % 3) + 1,
        bathrooms: (uIdx % 2) + 1,
        area: 750 + uIdx * 220,
        monthlyRent: 2100 + pIdx * 250 + uIdx * 200,
        securityDeposit: 2100 + pIdx * 250 + uIdx * 200,
        status: isOccupied ? 'occupied' : 'available',
        currentTenant: assignedTenant ? assignedTenant._id : null,
        description: `Executive ${ (uIdx % 3) + 1 }BR suite at ${properties[pIdx].title}.`,
      });
    }
  }

  const units = [];
  for (const u of unitsData) {
    const unit = await Unit.create(u);
    units.push(unit);
  }

  // 4. Create Leases (30 Leases / Bookings)
  const leasesData = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const unit = units[i % units.length];
    const tenant = tenants[i % tenants.length];
    const property = properties.find((p) => p._id.toString() === unit.property.toString()) || properties[0];

    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - (6 - (i % 6)));
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const leaseNum = `LSE-2026-${String(i + 1).padStart(4, '0')}`;
    const status = i === 28 ? 'pending' : i === 29 ? 'expired' : 'active';

    leasesData.push({
      leaseNumber: leaseNum,
      tenant: tenant._id,
      property: property._id,
      unit: unit._id,
      startDate,
      endDate,
      monthlyRent: unit.monthlyRent,
      securityDeposit: unit.securityDeposit,
      status,
      paymentDueDay: 1 + (i % 5),
      terms: `12-Month Executive Residential Lease Agreement for Unit ${unit.unitNumber}.`,
    });
  }

  const leases = [];
  for (const l of leasesData) {
    const lease = await Lease.create(l);
    leases.push(lease);
  }

  // 5. Create Rental Applications (25 Bookings / Applications)
  const applicationsData = [];
  const appStatuses = ['pending', 'approved', 'rejected', 'withdrawn'];
  const employers = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Salesforce', 'Stripe', 'Boston Consulting', 'JPMorgan', 'Tesla', 'Adobe'];

  for (let i = 0; i < 25; i++) {
    const unit = units[(i + 5) % units.length];
    const tenant = tenants[(i + 4) % tenants.length];
    const property = properties.find((p) => p._id.toString() === unit.property.toString()) || properties[0];

    const moveInDate = new Date(now);
    moveInDate.setDate(moveInDate.getDate() + 10 + (i * 2));

    applicationsData.push({
      tenant: tenant._id,
      unit: unit._id,
      property: property._id,
      status: appStatuses[i % appStatuses.length],
      moveInDate,
      employmentInfo: {
        employer: employers[i % employers.length],
        position: 'Lead Engineer / Operations Director',
        monthlyIncome: 8800 + (i * 280),
      },
      previousAddress: `${200 + i * 12} Metropolitan Blvd, Suite ${i + 1}`,
      references: [
        { name: 'David Vance', phone: `+1-555-08${String(i).padStart(2, '0')}`, relationship: 'Former Landlord' },
        { name: 'Samantha Cole', phone: `+1-555-09${String(i).padStart(2, '0')}`, relationship: 'Senior VP' },
      ],
      message: `Prospective resident booking application for unit ${unit.unitNumber} at ${property.title}. Verified employment and tier-1 credit history.`,
    });
  }

  for (const a of applicationsData) {
    await RentalApplication.create(a);
  }

  // 6. Create Maintenance Requests / Repairs (40 Tickets Total - Exactly 5 for each of the 8 categories)
  const maintenanceTickets = [
    // --- 1. PLUMBING (5) ---
    { cat: 'plumbing', title: 'Bathroom sink drain draining slowly and bubbling', desc: 'Double vanity sink draining slowly with minor air bubbling.', priority: 'medium', status: 'in_progress', est: 150, act: 0 },
    { cat: 'plumbing', title: 'Kitchen sink high-pressure hose fitting dripping', desc: 'Braided stainless supply line under the sink shows continuous seepage.', priority: 'high', status: 'pending', est: 280, act: 0 },
    { cat: 'plumbing', title: 'Commercial pressure regulator valve replacement', desc: 'Main water shutoff valve in utility room failing pressure regulation check.', priority: 'emergency', status: 'resolved', est: 450, act: 420, res: 'Replaced brass pressure relief valve and pressure tested system to 60 PSI.' },
    { cat: 'plumbing', title: 'Bathtub thermostatic mixing valve stuck on scalding', desc: 'Shower cartridge in guest bath cannot adjust temperature below 115 degrees.', priority: 'high', status: 'assigned', est: 190, act: 0 },
    { cat: 'plumbing', title: 'Garbage disposal unit internal seal failure and leak', desc: 'Undersink disposal unit leaking water from bottom motor casing during operation.', priority: 'low', status: 'resolved', est: 160, act: 155, res: 'Installed replacement InSinkErator 3/4 HP disposal unit.' },

    // --- 2. ELECTRICAL (5) ---
    { cat: 'electrical', title: 'Recessed kitchen LED ceiling lights flickering', desc: 'Three LED downlights in kitchen zone flickering when dimmer is set at 50%.', priority: 'low', status: 'resolved', est: 85, act: 80, res: 'Replaced outdated Lutron dimmer with ELV digital switch.' },
    { cat: 'electrical', title: 'Master bedroom GFCI wall outlet tripping under load', desc: 'Bedroom GFCI circuit breaker repeatedly trips when laptop workstation runs.', priority: 'high', status: 'in_progress', est: 220, act: 0 },
    { cat: 'electrical', title: 'Main circuit breaker panel sub-feed thermal anomaly', desc: 'Breaker box emits buzzing noise and electrical odor during peak heating cycle.', priority: 'emergency', status: 'assigned', est: 550, act: 0 },
    { cat: 'electrical', title: 'Hallway emergency exit luminaire backup battery fault', desc: 'Illuminated exit sign battery indicator flashing amber warning cycle.', priority: 'medium', status: 'pending', est: 120, act: 0 },
    { cat: 'electrical', title: 'Balcony waterproof weather-rated outlet cover cracked', desc: 'Exterior patio quad outlet plastic gasket damaged by storm winds.', priority: 'low', status: 'resolved', est: 75, act: 70, res: 'Replaced with heavy-duty in-use bubble weather cover.' },

    // --- 3. HVAC (5) ---
    { cat: 'hvac', title: 'Central air conditioner blowing room-temperature air', desc: 'Living room dual-zone AC fails to cool below 78 degrees.', priority: 'high', status: 'pending', est: 350, act: 0 },
    { cat: 'hvac', title: 'Ecobee smart digital thermostat screen frozen', desc: 'Wall thermostat digital display is blank and unresponsive to touch.', priority: 'medium', status: 'resolved', est: 160, act: 145, res: 'Replaced low-voltage C-wire transformer fuse and recalibrated smart thermostat.' },
    { cat: 'hvac', title: 'Seasonal HEPA air filter replacement and condenser flush', desc: 'Semi-annual high-efficiency furnace filter change and compressor coil cleaning.', priority: 'low', status: 'assigned', est: 110, act: 0 },
    { cat: 'hvac', title: 'Heat pump reversing valve failing to switch to heating mode', desc: 'Heat pump blowing cold ambient air despite heat call from smart thermostat.', priority: 'emergency', status: 'in_progress', est: 480, act: 0 },
    { cat: 'hvac', title: 'Blower fan motor bearing squeal during low-speed cycle', desc: 'High-pitched metal friction noise coming from ceiling air handler plenum.', priority: 'medium', status: 'pending', est: 260, act: 0 },

    // --- 4. APPLIANCE (5) ---
    { cat: 'appliance', title: 'Bosch dishwasher perimeter door gasket leaking', desc: 'Water pools on kitchen hardwood floor during the high-temperature wash cycle.', priority: 'medium', status: 'in_progress', est: 190, act: 0 },
    { cat: 'appliance', title: 'Convection oven heating element failing to reach set temp', desc: 'Oven preheat takes 45 minutes and maximum bake temperature never exceeds 325.', priority: 'medium', status: 'pending', est: 240, act: 0 },
    { cat: 'appliance', title: 'Samsung French door refrigerator ice maker motor jammed', desc: 'In-door ice dispenser auger motor making clicking noise without discharging ice.', priority: 'low', status: 'resolved', est: 175, act: 160, res: 'Cleared chute ice bridge and installed new OEM auger motor assembly.' },
    { cat: 'appliance', title: 'Front-load washing machine drum vibration and loud thumping', desc: 'Washer chassis shakes violently during final high-spin cycle.', priority: 'high', status: 'assigned', est: 210, act: 0 },
    { cat: 'appliance', title: 'Microwave oven magnetron intermittent arcing and popping', desc: 'Over-the-range microwave produces electrical spark sound when heating.', priority: 'high', status: 'resolved', est: 290, act: 275, res: 'Replaced waveguide cover and faulty high-voltage diode.' },

    // --- 5. STRUCTURAL (5) ---
    { cat: 'structural', title: 'Private balcony concrete slab surface fissure', desc: 'Hairline crack spanning four feet observed along outdoor concrete balcony edge.', priority: 'high', status: 'assigned', est: 680, act: 0 },
    { cat: 'structural', title: 'Living room engineered oak flooring buckling near terrace', desc: 'Floorboards near the sliding patio door have expanded upward due to humidity.', priority: 'medium', status: 'in_progress', est: 420, act: 0 },
    { cat: 'structural', title: 'Drywall seam stress fracture above hallway entryway', desc: 'Vertical crack visible in plaster drywall above master bedroom door frame.', priority: 'low', status: 'pending', est: 180, act: 0 },
    { cat: 'structural', title: 'Balcony aluminum railing loose base anchor bolts', desc: 'Exterior decorative guardrail wiggles when pressure is applied.', priority: 'emergency', status: 'in_progress', est: 520, act: 0 },
    { cat: 'structural', title: 'Acoustic window double-pane argon seal failure with haze', desc: 'Internal condensation between glass panes in living room picture window.', priority: 'low', status: 'resolved', est: 340, act: 330, res: 'Replaced insulated glass unit (IGU) sash with factory warranty unit.' },

    // --- 6. PEST (5) ---
    { cat: 'pest', title: 'Pantry sugar ant ingress near exterior wall baseboard', desc: 'Line of sugar ants entering through minute baseboard gap along kitchen wall.', priority: 'low', status: 'resolved', est: 150, act: 140, res: 'Applied biological gel bait and sealed perimeter exterior siding ingress cracks.' },
    { cat: 'pest', title: 'Suspected subterranean termite droppings in storage closet', desc: 'Tenant detected small pile of wood frass pellets inside bedroom closet trim.', priority: 'high', status: 'in_progress', est: 850, act: 0 },
    { cat: 'pest', title: 'Balcony roofline mud dauber wasp nest cluster', desc: 'Active mud wasp nest cluster forming beneath upper balcony soffit eave.', priority: 'medium', status: 'pending', est: 165, act: 0 },
    { cat: 'pest', title: 'Sub-level storage locker silverfish activity inspection', desc: 'Silverfish observed in storage unit boxes in basement storage wing.', priority: 'low', status: 'assigned', est: 130, act: 0 },
    { cat: 'pest', title: 'Perimeter rodent bait station quarterly refill and inspection', desc: 'Routine preventative service for exterior landscape rat bait boxes.', priority: 'low', status: 'resolved', est: 175, act: 175, res: 'Inspected and replenished all 8 exterior Tamper-Resistant stations.' },

    // --- 7. CLEANING (5) ---
    { cat: 'cleaning', title: 'Comprehensive deep steam carpet sanitization prior to move-in', desc: 'Commercial hot water carpet extraction requested for three bedrooms.', priority: 'low', status: 'resolved', est: 220, act: 210, res: 'Completed multi-stage industrial steam cleaning and antimicrobial treatment.' },
    { cat: 'cleaning', title: 'Post-painting overspray window glass scraping and detailing', desc: 'Window panes and aluminum tracks in master bedroom have fine plaster dust.', priority: 'low', status: 'assigned', est: 140, act: 0 },
    { cat: 'cleaning', title: 'Breezeway exterior paving pressure wash and oil stain removal', desc: 'Front entrance walkway and adjacent private parking bay require high-pressure wash.', priority: 'medium', status: 'pending', est: 195, act: 0 },
    { cat: 'cleaning', title: 'Common area fitness room antiviral sanitize and mirror polish', desc: 'Scheduled deep sanitation of gym free weights and aerobic equipment.', priority: 'low', status: 'resolved', est: 160, act: 150, res: 'Completed hospital-grade fogging and high-touch surface disinfection.' },
    { cat: 'cleaning', title: 'Refuse chute hopper degreasing and enzymatic odor treatment', desc: 'Trash chute on 2nd and 3rd floors emitting odor during summer months.', priority: 'medium', status: 'in_progress', est: 275, act: 0 },

    // --- 8. OTHER (5) ---
    { cat: 'other', title: 'Smart RFID deadbolt lock battery depletion and keypad latency', desc: 'Keypad entrance deadbolt beeps low-battery warning and tag latency occurs.', priority: 'high', status: 'resolved', est: 95, act: 90, res: 'Installed lithium AA batteries and resynced Bluetooth lock bridge module.' },
    { cat: 'other', title: 'Parking garage motorized overhead gate remote sensor misalignment', desc: 'Underground garage rolling security gate safety optical eye misaligned.', priority: 'medium', status: 'in_progress', est: 260, act: 0 },
    { cat: 'other', title: 'Lobby mail delivery parcel locker master lock cylinder jammed', desc: 'Parcel locker compartment 14 door will not latch shut when package key is removed.', priority: 'low', status: 'pending', est: 85, act: 0 },
    { cat: 'other', title: 'Elevator cab secondary LCD floor indicator display artifact', desc: 'Car 2 interior digital floor position monitor displays scrambled pixels.', priority: 'low', status: 'assigned', est: 310, act: 0 },
    { cat: 'other', title: 'Courtyard landscaping smart drip irrigation timer malfunction', desc: 'Sprinkler solenoid zone 4 staying open past scheduled 20-minute water cycle.', priority: 'medium', status: 'resolved', est: 140, act: 130, res: 'Replaced 24V Hunter irrigation solenoid valve diaphragm.' },
  ];

  for (let i = 0; i < maintenanceTickets.length; i++) {
    const t = maintenanceTickets[i];
    const unit = units[i % units.length];
    const tenant = tenants[i % tenants.length];
    const property = properties.find((p) => p._id.toString() === unit.property.toString()) || properties[0];
    const manager = managers[i % managers.length];

    await MaintenanceRequest.create({
      tenant: tenant._id,
      property: property._id,
      unit: unit._id,
      title: t.title,
      description: t.desc,
      category: t.cat,
      priority: t.priority,
      status: t.status,
      assignedTo: t.status !== 'pending' ? manager._id : null,
      estimatedCost: t.est,
      actualCost: t.act || 0,
      resolution: t.res || null,
      resolvedDate: t.res ? new Date() : null,
    });
  }

  // 7. Create Payments (30 Payments)
  for (let i = 0; i < 30; i++) {
    const lease = leases[i % leases.length];
    const pDate = new Date(now);
    pDate.setDate(pDate.getDate() - (i * 3));

    const methods = ['bank_transfer', 'credit_card', 'online', 'cash'];
    const pStatus = i === 28 ? 'pending' : i === 29 ? 'failed' : 'completed';

    await Payment.create({
      paymentNumber: `PAY-202611-${String(i + 1).padStart(4, '0')}`,
      lease: lease._id,
      tenant: lease.tenant,
      property: lease.property,
      unit: lease.unit,
      amount: lease.monthlyRent,
      paymentDate: pDate,
      dueDate: pDate,
      paymentMethod: methods[i % methods.length],
      status: pStatus,
      receiptNumber: `REC-202611-${String(i + 1).padStart(4, '0')}`,
      transactionId: `TXN-${880000 + i}`,
      notes: `Verified rent payment record #${i + 1}`,
      recordedBy: managers[0]._id,
    });
  }

  // 8. Create Activity Logs (30 Logs)
  for (let i = 0; i < 30; i++) {
    const u = createdUsers[i % createdUsers.length];
    await ActivityLog.create({
      user: u._id,
      action: i % 2 === 0 ? 'login' : 'audit_checkpoint',
      resourceType: 'Security',
      details: `User ${u.name} [${u.role}] authenticated from terminal node #${i + 1}`,
      ipAddress: `192.168.1.${10 + (i % 50)}`,
    });
  }

  console.log('✅ Database successfully seeded with 55 users, 30 leases, 25 applications, and 40 repairs across all 8 categories!');
};

module.exports = { seedData };

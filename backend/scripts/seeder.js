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
  console.log('📦 Seeding database collections with comprehensive 20+ datasets...');

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

  // 1. Create Users (30 Users Total)
  const usersData = [
    // 2 Admins
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
    // 6 Owners
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
      phone: '+1-555-0202',
      address: '742 Evergreen Terrace, Seattle, WA 98101',
    },
    {
      name: 'Sophia Rodriguez (Owner)',
      email: 'owner4@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0203',
      address: '88 Ocean Drive, Suite 12B, Miami, FL 33139',
    },
    {
      name: 'David Kim (Owner)',
      email: 'owner5@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0204',
      address: '101 Silicon Valley Way, San Jose, CA 95113',
    },
    {
      name: 'Amanda Foster (Owner)',
      email: 'owner6@test.com',
      password: 'owner123',
      role: 'owner',
      phone: '+1-555-0205',
      address: '450 Peachtree Street NE, Atlanta, GA 30308',
    },
    // 5 Managers
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
      phone: '+1-555-0206',
      address: '300 Michigan Ave, Unit 8, Chicago, IL 60611',
    },
    {
      name: 'Rachel Green (Manager)',
      email: 'manager4@test.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1-555-0207',
      address: '19 Greenwich Village, New York, NY 10014',
    },
    {
      name: 'Daniel Martinez (Manager)',
      email: 'manager5@test.com',
      password: 'manager123',
      role: 'manager',
      phone: '+1-555-0208',
      address: '600 Congress Ave, Austin, TX 78701',
    },
    // 17 Tenants
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
      phone: '+1-555-0209',
      address: 'Apt 301, Riverfront Residences, Chicago, IL 60606',
    },
    {
      name: 'Olivia Brown (Tenant)',
      email: 'tenant7@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0210',
      address: 'Unit 14B, Skyline Tower, Seattle, WA 98104',
    },
    {
      name: 'James Wilson (Tenant)',
      email: 'tenant8@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0211',
      address: 'Suite 204, Highline Apartments, New York, NY 10011',
    },
    {
      name: 'Mia Davis (Tenant)',
      email: 'tenant9@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0212',
      address: 'Apt 12, Sunny Isles Court, Miami, FL 33160',
    },
    {
      name: 'Benjamin Miller (Tenant)',
      email: 'tenant10@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0213',
      address: 'Townhouse 3, Oakwood Estates, Austin, TX 78703',
    },
    {
      name: 'Charlotte Taylor (Tenant)',
      email: 'tenant11@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0214',
      address: 'Unit 502, Bayview Lofts, San Francisco, CA 94107',
    },
    {
      name: 'Alexander Lee (Tenant)',
      email: 'tenant12@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0215',
      address: 'Apt 4B, Maple Grove, Denver, CO 80202',
    },
    {
      name: 'Harper White (Tenant)',
      email: 'tenant13@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0216',
      address: 'Unit 108, Pine Crest Villas, Portland, OR 97201',
    },
    {
      name: 'Elijah Harris (Tenant)',
      email: 'tenant14@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0217',
      address: 'Apt 6C, Magnolia Gardens, Atlanta, GA 30309',
    },
    {
      name: 'Amelia Martin (Tenant)',
      email: 'tenant15@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0218',
      address: 'Studio 18, Midtown Lofts, Houston, TX 77002',
    },
    {
      name: 'William Anderson (Tenant)',
      email: 'tenant16@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0219',
      address: 'Apt 201, Harbor Point, Boston, MA 02125',
    },
    {
      name: 'Evelyn Thomas (Tenant)',
      email: 'tenant17@test.com',
      password: 'tenant123',
      role: 'tenant',
      phone: '+1-555-0220',
      address: 'Unit 310, Sunset Ridge, Phoenix, AZ 85004',
    },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await User.create(u);
    createdUsers.push(user);
  }

  const [admin1, admin2, owner1, owner2, owner3, owner4, owner5, owner6, manager1, manager2, manager3, manager4, manager5] = createdUsers.slice(0, 13);
  const tenants = createdUsers.slice(13);

  // 2. Create Properties (6 Properties)
  const propertiesData = [
    {
      title: 'Grand Horizon Luxury Residences',
      description: 'Ultra-modern luxury apartment complex with panoramic skyline views, 24/7 concierge, rooftop pool, and fitness center.',
      address: { street: '450 West 42nd Street', city: 'New York', state: 'NY', zipCode: '10036', country: 'USA' },
      type: 'apartment',
      owner: owner1._id,
      manager: manager1._id,
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
      amenities: ['Gym', 'Pool', 'Concierge', 'Rooftop Deck', 'Parking', 'Elevator', 'Pet Friendly'],
      totalUnits: 4,
      yearBuilt: 2021,
      parkingSpaces: 40,
    },
    {
      title: 'Silverstone Waterfront Condominiums',
      description: 'Premier coastal residential towers situated directly on the South Beach shoreline with private dock access and spa.',
      address: { street: '100 Ocean Drive', city: 'Miami', state: 'FL', zipCode: '33139', country: 'USA' },
      type: 'condo',
      owner: owner2._id,
      manager: manager2._id,
      images: ['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
      amenities: ['Waterfront', 'Private Beach', 'Spa', 'Valet Parking', 'Tennis Court'],
      totalUnits: 4,
      yearBuilt: 2019,
      parkingSpaces: 30,
    },
    {
      title: 'Beacon Hill Historic Brownstones',
      description: 'Meticulously preserved 19th-century brownstone townhomes offering classic architectural charm coupled with modern interior finishes.',
      address: { street: '72 Mount Vernon Street', city: 'Boston', state: 'MA', zipCode: '02108', country: 'USA' },
      type: 'townhouse',
      owner: owner3._id,
      manager: manager2._id,
      images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      amenities: ['Fireplace', 'Hardwood Floors', 'Private Garden', 'Wine Cellar'],
      totalUnits: 4,
      yearBuilt: 1910,
      parkingSpaces: 10,
    },
    {
      title: 'Pacific Heights Executive Suites',
      description: 'Sophisticated modern high-rise in upscale San Francisco featuring smart home automations, floor-to-ceiling glass, and wine cellar.',
      address: { street: '2100 California Street', city: 'San Francisco', state: 'CA', zipCode: '94115', country: 'USA' },
      type: 'apartment',
      owner: owner4._id,
      manager: manager3._id,
      images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'],
      amenities: ['Smart Home', 'Doorman', 'EV Charging', 'Sky Lounge'],
      totalUnits: 4,
      yearBuilt: 2022,
      parkingSpaces: 25,
    },
    {
      title: 'Magnolia Midtown Parkside Residences',
      description: 'Garden-style community adjacent to Piedmont Park offering direct greenway access, saltwater pool, and resident coworking hub.',
      address: { street: '855 Peachtree Street NE', city: 'Atlanta', state: 'GA', zipCode: '30308', country: 'USA' },
      type: 'apartment',
      owner: owner5._id,
      manager: manager4._id,
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
      amenities: ['Dog Park', 'Saltwater Pool', 'Coworking Hub', 'Clubhouse'],
      totalUnits: 4,
      yearBuilt: 2020,
      parkingSpaces: 35,
    },
    {
      title: 'Austin Riverwalk Modern Lofts',
      description: 'Industrial-chic loft apartments along Lady Bird Lake with 14-foot exposed concrete ceilings and floor-to-ceiling glass balconies.',
      address: { street: '300 Colorado Street', city: 'Austin', state: 'TX', zipCode: '78701', country: 'USA' },
      type: 'condo',
      owner: owner6._id,
      manager: manager5._id,
      images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
      amenities: ['Kayak Launch', 'Rooftop Infinity Pool', 'Bicycle Storage', 'Fitness Center'],
      totalUnits: 4,
      yearBuilt: 2023,
      parkingSpaces: 20,
    },
  ];

  const properties = [];
  for (const p of propertiesData) {
    const prop = await Property.create(p);
    properties.push(prop);
  }

  // 3. Create Units (24 Units Total - 4 per property)
  const unitsData = [];
  const unitPrefixes = ['101', '102', '201', '202'];
  for (let pIdx = 0; pIdx < properties.length; pIdx++) {
    for (let uIdx = 0; uIdx < unitPrefixes.length; uIdx++) {
      const uNum = unitPrefixes[uIdx];
      const floor = parseInt(uNum.charAt(0), 10);
      const isOccupied = uIdx < 3;
      const assignedTenant = isOccupied ? tenants[(pIdx * 3 + uIdx) % tenants.length] : null;

      unitsData.push({
        property: properties[pIdx]._id,
        unitNumber: `${uNum}`,
        floor,
        bedrooms: (uIdx % 3) + 1,
        bathrooms: (uIdx % 2) + 1,
        area: 750 + uIdx * 250,
        monthlyRent: 2000 + pIdx * 300 + uIdx * 250,
        securityDeposit: 2000 + pIdx * 300 + uIdx * 250,
        status: isOccupied ? 'occupied' : 'available',
        currentTenant: assignedTenant ? assignedTenant._id : null,
        description: `Deluxe ${ (uIdx % 3) + 1 }BR unit in ${properties[pIdx].title} with premium designer fixtures.`,
      });
    }
  }

  const units = [];
  for (const u of unitsData) {
    const unit = await Unit.create(u);
    units.push(unit);
  }

  // 4. Create Leases (20 Comprehensive Leases / Bookings)
  const leasesData = [];
  const now = new Date();
  for (let i = 0; i < 20; i++) {
    const unit = units[i % units.length];
    const tenant = tenants[i % tenants.length];
    const property = properties.find((p) => p._id.toString() === unit.property.toString()) || properties[0];

    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - (6 - (i % 5)));
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const leaseNum = `LSE-2026-${String(i + 1).padStart(4, '0')}`;
    const status = i === 18 ? 'pending' : i === 19 ? 'expired' : 'active';

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
      terms: `Standard 12-Month Executive Residential Lease Agreement for ${unit.unitNumber}.`,
    });
  }

  const leases = [];
  for (const l of leasesData) {
    const lease = await Lease.create(l);
    leases.push(lease);
  }

  // 5. Create Rental Applications (20 Bookings / Applications)
  const applicationsData = [];
  const appStatuses = ['pending', 'approved', 'rejected', 'withdrawn'];
  const employers = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Salesforce', 'Stripe', 'Boston Consulting', 'JPMorgan'];

  for (let i = 0; i < 20; i++) {
    const unit = units[(i + 4) % units.length];
    const tenant = tenants[(i + 2) % tenants.length];
    const property = properties.find((p) => p._id.toString() === unit.property.toString()) || properties[0];

    const moveInDate = new Date(now);
    moveInDate.setDate(moveInDate.getDate() + 14 + (i * 3));

    applicationsData.push({
      tenant: tenant._id,
      unit: unit._id,
      property: property._id,
      status: appStatuses[i % appStatuses.length],
      moveInDate,
      employmentInfo: {
        employer: employers[i % employers.length],
        position: 'Senior Software Engineer / Product Lead',
        monthlyIncome: 8500 + (i * 350),
      },
      previousAddress: `${100 + i * 15} Continental Way, Suite ${i + 1}, Metro City`,
      references: [
        { name: 'Marcus Sterling', phone: `+1-555-08${String(i).padStart(2, '0')}`, relationship: 'Previous Landlord' },
        { name: 'Diana Prince', phone: `+1-555-09${String(i).padStart(2, '0')}`, relationship: 'Department Manager' },
      ],
      message: `Prospective tenant booking application for unit ${unit.unitNumber} at ${property.title}. Excellent credit score (790+) and verifiable rental track record.`,
    });
  }

  for (const a of applicationsData) {
    await RentalApplication.create(a);
  }

  // 6. Create Maintenance Requests / Repairs (24 Tickets - 3 for each of the 8 categories)
  const maintenanceTickets = [
    // --- 1. PLUMBING (3) ---
    {
      cat: 'plumbing',
      title: 'Bathroom sink drain draining slowly and bubbling',
      desc: 'The master bathroom double vanity sink is draining very slowly with minor air bubbling during usage.',
      priority: 'medium',
      status: 'in_progress',
      est: 150,
      act: 0,
      res: null,
    },
    {
      cat: 'plumbing',
      title: 'Kitchen sink high-pressure hose fitting dripping',
      desc: 'Braided stainless supply line under the kitchen sink shows continuous slow seepage into catch bucket.',
      priority: 'high',
      status: 'pending',
      est: 280,
      act: 0,
      res: null,
    },
    {
      cat: 'plumbing',
      title: 'Commercial pressure regulator valve replacement',
      desc: 'Main water shutoff valve in utility room failing pressure regulation check. Replacement required.',
      priority: 'emergency',
      status: 'resolved',
      est: 450,
      act: 420,
      res: 'Installed new Watts 3/4-inch brass pressure relief valve and pressure tested system to 60 PSI.',
    },

    // --- 2. ELECTRICAL (3) ---
    {
      cat: 'electrical',
      title: 'Recessed kitchen LED ceiling lights flickering',
      desc: 'Three LED downlights in kitchen zone are flickering intermittently when the dimmer slider is at 50%.',
      priority: 'low',
      status: 'resolved',
      est: 85,
      act: 80,
      res: 'Replaced outdated Lutron dimmer with ELV-compatible LED digital dimmer switch.',
    },
    {
      cat: 'electrical',
      title: 'Master bedroom GFCI wall outlet tripping under load',
      desc: 'Bedroom GFCI circuit breaker repeatedly trips when laptop workstation and air purifier run together.',
      priority: 'high',
      status: 'in_progress',
      est: 220,
      act: 0,
      res: null,
    },
    {
      cat: 'electrical',
      title: 'Main circuit breaker panel sub-feed thermal anomaly',
      desc: 'Breaker box emits noticeable buzzing noise and mild electrical odor during peak evening heating cycle.',
      priority: 'emergency',
      status: 'assigned',
      est: 550,
      act: 0,
      res: null,
    },

    // --- 3. HVAC (3) ---
    {
      cat: 'hvac',
      title: 'Central air conditioner blowing room-temperature air',
      desc: 'Living room dual-zone AC fails to cool below 78 degrees despite thermostat being programmed to 70.',
      priority: 'high',
      status: 'pending',
      est: 350,
      act: 0,
      res: null,
    },
    {
      cat: 'hvac',
      title: 'Ecobee smart digital thermostat screen frozen',
      desc: 'Wall thermostat digital display is blank and unresponsive to touch. HVAC system defaulting to standby.',
      priority: 'medium',
      status: 'resolved',
      est: 160,
      act: 145,
      res: 'Replaced low-voltage C-wire transformer fuse and recalibrated smart thermostat firmware.',
    },
    {
      cat: 'hvac',
      title: 'Seasonal HEPA air filter replacement and condenser flush',
      desc: 'Scheduled semi-annual high-efficiency furnace filter change and rooftop compressor fin coil cleaning.',
      priority: 'low',
      status: 'assigned',
      est: 110,
      act: 0,
      res: null,
    },

    // --- 4. APPLIANCE (3) ---
    {
      cat: 'appliance',
      title: 'Bosch dishwasher perimeter door gasket leaking',
      desc: 'Water pools on kitchen hardwood floor during the high-temperature sanitary wash and rinse cycle.',
      priority: 'medium',
      status: 'in_progress',
      est: 190,
      act: 0,
      res: null,
    },
    {
      cat: 'appliance',
      title: 'Convection oven heating element failing to reach set temperature',
      desc: 'Oven preheat takes 45 minutes and maximum bake temperature never exceeds 325 degrees.',
      priority: 'medium',
      status: 'pending',
      est: 240,
      act: 0,
      res: null,
    },
    {
      cat: 'appliance',
      title: 'Samsung French door refrigerator ice maker motor jammed',
      desc: 'In-door ice dispenser auger motor making clicking noise without discharging crushed or cubed ice.',
      priority: 'low',
      status: 'resolved',
      est: 175,
      act: 160,
      res: 'Cleared ice chute obstruction and installed new OEM auger motor assembly.',
    },

    // --- 5. STRUCTURAL (3) ---
    {
      cat: 'structural',
      title: 'Private balcony concrete slab surface fissure',
      desc: 'Hairline crack spanning four feet observed along outdoor concrete balcony edge near drain gutter.',
      priority: 'high',
      status: 'assigned',
      est: 680,
      act: 0,
      res: null,
    },
    {
      cat: 'structural',
      title: 'Living room engineered oak flooring buckling near terrace',
      desc: 'Two floorboards near the sliding patio door have expanded upward due to humidity variations.',
      priority: 'medium',
      status: 'in_progress',
      est: 420,
      act: 0,
      res: null,
    },
    {
      cat: 'structural',
      title: 'Drywall seam stress fracture above hallway entryway',
      desc: 'Vertical crack visible in plaster drywall above master bedroom door frame following building settlement.',
      priority: 'low',
      status: 'pending',
      est: 180,
      act: 0,
      res: null,
    },

    // --- 6. PEST (3) ---
    {
      cat: 'pest',
      title: 'Pantry sugar ant ingress near exterior wall baseboard',
      desc: 'Line of sugar ants entering through minute baseboard gap along kitchen north exterior wall.',
      priority: 'low',
      status: 'resolved',
      est: 150,
      act: 140,
      res: 'Applied child-safe biological gel bait and sealed perimeter exterior siding ingress cracks.',
    },
    {
      cat: 'pest',
      title: 'Suspected subterranean termite droppings in storage closet',
      desc: 'Tenant detected small pile of wood frass pellets inside bedroom closet corner trim.',
      priority: 'high',
      status: 'in_progress',
      est: 850,
      act: 0,
      res: null,
    },
    {
      cat: 'pest',
      title: 'Balcony roofline mud dauber wasp nest cluster',
      desc: 'Active mud wasp nest cluster forming beneath upper balcony soffit eave directly above patio chair.',
      priority: 'medium',
      status: 'pending',
      est: 165,
      act: 0,
      res: null,
    },

    // --- 7. CLEANING (3) ---
    {
      cat: 'cleaning',
      title: 'Comprehensive deep steam carpet sanitization prior to move-in',
      desc: 'Commercial truck-mounted hot water carpet extraction requested for three bedrooms before key handover.',
      priority: 'low',
      status: 'resolved',
      est: 220,
      act: 210,
      res: 'Completed multi-stage industrial steam cleaning, antimicrobial treatment, and high-velocity drying.',
    },
    {
      cat: 'cleaning',
      title: 'Post-painting overspray window glass scraping and detailing',
      desc: 'Window panes and aluminum tracks in master bedroom have fine plaster dust and latex paint haze.',
      priority: 'low',
      status: 'assigned',
      est: 140,
      act: 0,
      res: null,
    },
    {
      cat: 'cleaning',
      title: 'Breezeway exterior paving pressure wash and oil stain removal',
      desc: 'Front entrance walkway and adjacent private parking bay require high-pressure wash and degreaser.',
      priority: 'medium',
      status: 'pending',
      est: 195,
      act: 0,
      res: null,
    },

    // --- 8. OTHER (3) ---
    {
      cat: 'other',
      title: 'Smart RFID deadbolt lock battery depletion and keypad latency',
      desc: 'Keypad entrance deadbolt beeps low-battery warning and RFID key tag requires multiple attempts to unlock.',
      priority: 'high',
      status: 'resolved',
      est: 95,
      act: 90,
      res: 'Installed industrial-grade lithium AA batteries and resynced Bluetooth lock bridge module.',
    },
    {
      cat: 'other',
      title: 'Parking garage motorized overhead gate remote sensor misalignment',
      desc: 'Underground garage rolling security gate safety optical eye misaligned, causing gate to reopen.',
      priority: 'medium',
      status: 'in_progress',
      est: 260,
      act: 0,
      res: null,
    },
    {
      cat: 'other',
      title: 'Lobby mail delivery parcel locker master lock cylinder jammed',
      desc: 'Parcel locker compartment 14 door will not latch shut when package key is removed.',
      priority: 'low',
      status: 'pending',
      est: 85,
      act: 0,
      res: null,
    },
  ];

  for (let i = 0; i < maintenanceTickets.length; i++) {
    const t = maintenanceTickets[i];
    const unit = units[i % units.length];
    const tenant = tenants[i % tenants.length];
    const property = properties.find((p) => p._id.toString() === unit.property.toString()) || properties[0];
    const manager = createdUsers.find((u) => u.role === 'manager') || manager1;

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
      actualCost: t.act,
      resolution: t.res,
      resolvedDate: t.res ? new Date() : null,
    });
  }

  // 7. Create Payments (20 Payments)
  for (let i = 0; i < 20; i++) {
    const lease = leases[i % leases.length];
    const pDate = new Date(now);
    pDate.setDate(pDate.getDate() - (i * 4));

    const methods = ['bank_transfer', 'credit_card', 'online', 'cash'];
    const pStatus = i === 18 ? 'pending' : i === 19 ? 'failed' : 'completed';

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
      notes: `Verified rent installment record #${i + 1}`,
      recordedBy: manager1._id,
    });
  }

  // 8. Create Activity Logs (20 Logs)
  for (let i = 0; i < 20; i++) {
    const u = createdUsers[i % createdUsers.length];
    await ActivityLog.create({
      user: u._id,
      action: i % 2 === 0 ? 'login' : 'audit_checkpoint',
      resourceType: 'Security',
      details: `User ${u.name} [${u.role}] accessed enterprise console node #${i + 1}`,
      ipAddress: `192.168.1.${10 + i}`,
    });
  }

  console.log('✅ Database successfully initialized and seeded with 30 users, 20 leases, 20 applications, and 24 repairs across all 8 categories!');
};

module.exports = { seedData };

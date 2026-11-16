const http = require('http');

const newUsers = [
  // 1 Admin
  {
    name: 'Jessica Taylor (Admin)',
    email: 'admin2@propertymanager.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0201',
    address: '120 Executive Blvd, Suite 500, Chicago, IL 60601',
  },
  // 4 Owners
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
  // 3 Managers
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
  // 12 Tenants
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

function registerUser(userData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(userData);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve({ statusCode: res.statusCode, data });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

async function addAllUsers() {
  console.log(`Starting insertion of ${newUsers.length} users into the database...`);
  let successCount = 0;
  let alreadyExistsCount = 0;
  let errorCount = 0;

  for (let i = 0; i < newUsers.length; i++) {
    const u = newUsers[i];
    try {
      const res = await registerUser(u);
      if (res.statusCode === 201) {
        console.log(`[${i + 1}/${newUsers.length}] ✅ Created: ${u.name} (${u.email}) [${u.role}]`);
        successCount++;
      } else if (res.statusCode === 400 && res.data?.message?.includes('already registered')) {
        console.log(`[${i + 1}/${newUsers.length}] ℹ️ Already exists: ${u.name} (${u.email})`);
        alreadyExistsCount++;
      } else {
        console.warn(`[${i + 1}/${newUsers.length}] ⚠️ Status ${res.statusCode}:`, res.data || res.raw);
        errorCount++;
      }
    } catch (err) {
      console.error(`[${i + 1}/${newUsers.length}] ❌ Failed to register ${u.email}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Successfully Added: ${successCount}`);
  console.log(`Already Present:    ${alreadyExistsCount}`);
  console.log(`Errors:             ${errorCount}`);
  console.log(`Total Handled:      ${newUsers.length}`);
}

addAllUsers();

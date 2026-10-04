const bcrypt = require('bcryptjs');
const { pool, initDB } = require('./src/config/db');

async function seed() {
  console.log('--- Starting Database Seeder ---');
  await initDB();

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@12345', salt);
  const ownerPass = await bcrypt.hash('Owner@12345', salt);
  const userPass = await bcrypt.hash('User@123456', salt);

  // Clear existing data safely
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE ratings');
  await pool.query('TRUNCATE TABLE stores');
  await pool.query('TRUNCATE TABLE users');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');

  // Insert System Administrator
  const [adminResult] = await pool.query(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'System Administrator Officer', // 28 chars
      'admin@storerating.com',
      adminPass,
      'Suite 100, Admin Headquarters, 500 Silicon Avenue, Metro City',
      'ADMIN',
    ]
  );
  console.log(`Admin user created: admin@storerating.com / Admin@12345 (ID: ${adminResult.insertId})`);

  // Insert Store Owners
  const storeOwnersData = [
    {
      name: 'Alexander Mitchell Bennett', // 26 chars
      email: 'alex.organic@stores.com',
      address: 'Building 4, Green Valley Commerce Zone, Sector 18, City Center',
      storeName: 'Apex Organic Market & Grocers',
    },
    {
      name: 'Samantha Claire Reynolds', // 24 chars
      email: 'samantha.tech@stores.com',
      address: 'Plot 22, Innovation Plaza, Cybertech Park, North District',
      storeName: 'Nexus Digital Tech Emporium',
    },
    {
      name: 'Christopher James Walker', // 24 chars
      email: 'chris.bakery@stores.com',
      address: 'Cornerstone Lane 12, Old Heritage Square, East Quarter',
      storeName: 'Artisan Delight Gourmet Bakery',
    },
  ];

  const storeIds = [];

  for (const item of storeOwnersData) {
    const [ownerRes] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [item.name, item.email, ownerPass, item.address, 'STORE_OWNER']
    );

    const [storeRes] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [item.storeName, item.email, item.address, ownerRes.insertId]
    );

    storeIds.push(storeRes.insertId);
    console.log(`Store created: ${item.storeName} with Owner: ${item.email} / Owner@12345`);
  }

  // Insert Normal Users
  const normalUsersData = [
    {
      name: 'Benjamin Edward Harrison', // 24 chars
      email: 'benjamin.harrison@gmail.com',
      address: 'Apartment 304, Oakwood Residences, 742 Evergreen Terrace',
    },
    {
      name: 'Katherine Michelle Parker', // 25 chars
      email: 'katherine.parker@gmail.com',
      address: 'House 82, Maple Grove Enclave, West End Boulevard',
    },
    {
      name: 'Jonathan Robert Campbell', // 24 chars
      email: 'jonathan.campbell@gmail.com',
      address: 'Unit 15, Pinecrest Heights, Central Avenue 400',
    },
  ];

  const userIds = [];
  for (const u of normalUsersData) {
    const [uRes] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [u.name, u.email, userPass, u.address, 'USER']
    );
    userIds.push(uRes.insertId);
    console.log(`Normal user created: ${u.email} / User@123456`);
  }

  // Insert Sample Ratings
  // User 0 (Benjamin)
  await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [userIds[0], storeIds[0], 5]);
  await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [userIds[0], storeIds[1], 4]);

  // User 1 (Katherine)
  await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [userIds[1], storeIds[0], 4]);
  await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [userIds[1], storeIds[2], 5]);

  // User 2 (Jonathan)
  await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [userIds[2], storeIds[1], 3]);
  await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [userIds[2], storeIds[2], 4]);

  console.log('Sample ratings inserted successfully.');
  console.log('--- Database Seeding Completed ---');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

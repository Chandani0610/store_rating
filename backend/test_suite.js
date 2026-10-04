// End-to-end verification script testing all requirements strictly from the documentation

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  FULLSTACK CODING CHALLENGE: VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(health.status === 'ok', 'Server health check returns ok');

    // 2. Form Validations Test
    console.log('\n--- 1. Testing Strict Form Validations ---');
    
    // Short name (< 20 chars) should be rejected
    const badNameRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Name', // 10 chars (invalid, min 20)
        email: 'short.name@example.com',
        address: '123 Test Street, Valid City',
        password: 'Password@123',
      }),
    });
    assert(badNameRes.status === 400, 'Rejects signup with Name shorter than 20 characters');

    // Password without uppercase should be rejected
    const badPassRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name Between Twenty And Sixty Chars',
        email: 'test.badpass@example.com',
        address: '123 Test Street, Valid City',
        password: 'password@123', // missing uppercase
      }),
    });
    assert(badPassRes.status === 400, 'Rejects signup with password missing uppercase letter');

    // Password without special character should be rejected
    const badPassNoSpecialRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name Between Twenty And Sixty Chars',
        email: 'test.badpass2@example.com',
        address: '123 Test Street, Valid City',
        password: 'Password1234', // missing special char
      }),
    });
    assert(badPassNoSpecialRes.status === 400, 'Rejects signup with password missing special character');

    // Valid signup for Normal User
    const validSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Verification User Account', // 30 chars
        email: `test.user.${Date.now()}@example.com`,
        address: '404 Verification Street, Software Suite 200, Cyber City',
        password: 'ValidUserPass@1', // 15 chars, uppercase, special
      }),
    });
    const signupData = await validSignupRes.json();
    assert(validSignupRes.status === 201 && signupData.success, 'Allows signup with valid form constraints');
    assert(signupData.user.role === 'USER', 'Signed up user has USER role');

    // 3. Single Login System for all 3 roles
    console.log('\n--- 2. Single Login System for All Roles ---');
    
    // Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@storerating.com', password: 'Admin@12345' }),
    });
    const adminData = await adminLoginRes.json();
    assert(adminData.success && adminData.user.role === 'ADMIN', 'Admin user logs in successfully');
    const adminToken = adminData.token;

    // Normal User login
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'benjamin.harrison@gmail.com', password: 'User@123456' }),
    });
    const userData = await userLoginRes.json();
    assert(userData.success && userData.user.role === 'USER', 'Normal user logs in successfully');
    const userToken = userData.token;

    // Store Owner login
    const ownerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.organic@stores.com', password: 'Owner@12345' }),
    });
    const ownerData = await ownerLoginRes.json();
    assert(ownerData.success && ownerData.user.role === 'STORE_OWNER', 'Store owner logs in successfully');
    const ownerToken = ownerData.token;

    // 4. System Administrator Functionalities
    console.log('\n--- 3. System Administrator Functionalities ---');

    // Admin Dashboard Stats
    const statsRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    assert(
      statsData.success &&
      typeof statsData.stats.totalUsers === 'number' &&
      typeof statsData.stats.totalStores === 'number' &&
      typeof statsData.stats.totalRatings === 'number',
      `Admin Dashboard displays Total Users (${statsData.stats.totalUsers}), Stores (${statsData.stats.totalStores}), Ratings (${statsData.stats.totalRatings})`
    );

    // Admin View Stores
    const adminStoresRes = await fetch(`${BASE_URL}/admin/stores?sortBy=name&sortOrder=asc`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminStoresData = await adminStoresRes.json();
    assert(
      adminStoresData.success &&
      adminStoresData.stores.length > 0 &&
      adminStoresData.stores[0].name &&
      adminStoresData.stores[0].email &&
      adminStoresData.stores[0].address !== undefined &&
      adminStoresData.stores[0].rating !== undefined,
      'Admin views list of stores with Name, Email, Address, Rating'
    );

    // Admin View Users (with Store Owner Rating if store owner)
    const adminUsersRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminUsersData = await adminUsersRes.json();
    assert(adminUsersData.success && adminUsersData.users.length > 0, 'Admin views list of users');

    const storeOwnerInList = adminUsersData.users.find(u => u.role === 'STORE_OWNER');
    assert(
      storeOwnerInList && storeOwnerInList.storeRating !== null,
      `Store Owner in user list displays their store rating (${storeOwnerInList?.storeRating} stars)`
    );

    // Admin Add New Store
    const newStoreName = `Seeded Fresh Mart ${Date.now().toString().slice(-4)}`;
    const newStoreEmail = `freshmart.${Date.now()}@stores.com`;
    const addStoreRes = await fetch(`${BASE_URL}/admin/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: newStoreName,
        email: newStoreEmail,
        address: '88 Fresh Way Boulevard, Green Valley Hub',
        ownerPassword: 'StoreOwner@123',
      }),
    });
    const addStoreData = await addStoreRes.json();
    assert(addStoreRes.status === 201 && addStoreData.success, 'Admin can add new stores');

    // Admin Add New User
    const addUserRes = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'New Administrator User Account', // 30 chars
        email: `newadmin.${Date.now()}@storerating.com`,
        address: 'Admin Operations Wing, 10th Floor, City Hub',
        password: 'AdminPassword@1',
        role: 'ADMIN',
      }),
    });
    const addUserData = await addUserRes.json();
    assert(addUserRes.status === 201 && addUserData.success, 'Admin can add new users (normal or admin)');

    // 5. Normal User Functionalities
    console.log('\n--- 4. Normal User Functionalities ---');

    // View registered stores and search by name/address
    const userStoresRes = await fetch(`${BASE_URL}/stores?search=Organic`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const userStoresData = await userStoresRes.json();
    assert(
      userStoresData.success &&
      userStoresData.stores.length > 0 &&
      userStoresData.stores[0].name.includes('Organic'),
      'Normal User can search stores by Name and Address'
    );

    const targetStore = userStoresData.stores[0];
    assert(
      targetStore.name &&
      targetStore.address &&
      targetStore.overallRating !== undefined &&
      targetStore.userSubmittedRating !== undefined,
      `Store listing displays Name, Address, Overall Rating (${targetStore.overallRating}), and User's Submitted Rating (${targetStore.userSubmittedRating})`
    );

    // Submit / Modify rating (between 1 and 5)
    const ratingRes = await fetch(`${BASE_URL}/stores/${targetStore.id}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ rating: 5 }),
    });
    const ratingData = await ratingRes.json();
    assert(
      ratingData.success && ratingData.data.userSubmittedRating === 5,
      'Normal User can submit / modify rating (1 to 5) for store'
    );

    // Reject invalid rating (e.g. 6 or 0)
    const badRatingRes = await fetch(`${BASE_URL}/stores/${targetStore.id}/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ rating: 6 }),
    });
    assert(badRatingRes.status === 400, 'Rejects rating outside 1 to 5 range');

    // 6. Store Owner Functionalities
    console.log('\n--- 5. Store Owner Functionalities ---');

    const ownerDashRes = await fetch(`${BASE_URL}/store-owner/dashboard`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const ownerDashData = await ownerDashRes.json();
    assert(
      ownerDashData.success &&
      ownerDashData.hasStore &&
      typeof ownerDashData.averageRating === 'number',
      `Store Owner sees average rating of their store: ${ownerDashData.averageRating} / 5.0`
    );
    assert(
      Array.isArray(ownerDashData.ratings) &&
      ownerDashData.ratings.length > 0 &&
      ownerDashData.ratings[0].user.name &&
      ownerDashData.ratings[0].rating !== undefined,
      `Store Owner views list of users who submitted ratings for their store (${ownerDashData.ratings.length} user reviews found)`
    );

    // 7. Password Update Functionality
    console.log('\n--- 6. Password Update Functionality ---');
    const updatePassRes = await fetch(`${BASE_URL}/auth/update-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'User@123456',
        newPassword: 'UpdatedPass@123',
      }),
    });
    const updatePassData = await updatePassRes.json();
    assert(updatePassData.success, 'User can update password after logging in (with valid 8-16 chars, uppercase & special)');

    // Revert password back for demo convenience
    await fetch(`${BASE_URL}/auth/update-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'UpdatedPass@123',
        newPassword: 'User@123456',
      }),
    });

  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed === 0) {
    console.log('ALL DOCUMENTATION REQUIREMENTS VERIFIED AND SATISFIED!');
  } else {
    process.exit(1);
  }
}

runTests();

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalStores }]] = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');
    const [[{ totalRatings }]] = await pool.query('SELECT COUNT(*) AS totalRatings FROM ratings');

    // Also get role breakdown for nice modern UI insights
    const [roles] = await pool.query(`
      SELECT role, COUNT(*) AS count FROM users GROUP BY role
    `);

    return res.json({
      success: true,
      stats: {
        totalUsers: Number(totalUsers) || 0,
        totalStores: Number(totalStores) || 0,
        totalRatings: Number(totalRatings) || 0,
        rolesBreakdown: roles.reduce((acc, curr) => ({ ...acc, [curr.role]: Number(curr.count) }), {}),
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics.' });
  }
};

// View list of users with filters and sorting
// Document: "Can view a list of normal and admin users with: Name, Email, Address, Role"
// Document: "Can apply filters on all listings based on Name, Email, Address, and Role."
// Document: "Can view details of all users, including Name, Email, Address, and Role. If the user is a Store Owner, their Rating should also be displayed."
// Document: "All tables should support sorting (ascending/descending) for key fields like Name, Email, etc."
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, search, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS store_rating,
        COUNT(r.id) AS store_rating_count,
        s.id AS store_id,
        s.name AS store_name
      FROM users u
      LEFT JOIN stores s ON (s.owner_id = u.id OR s.email = u.email)
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (name) {
      query += ` AND u.name LIKE ?`;
      params.push(`%${name}%`);
    }

    if (email) {
      query += ` AND u.email LIKE ?`;
      params.push(`%${email}%`);
    }

    if (address) {
      query += ` AND u.address LIKE ?`;
      params.push(`%${address}%`);
    }

    if (role && role !== 'ALL') {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    query += ` GROUP BY u.id, s.id, s.name`;

    // Sorting
    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      created_at: 'u.created_at',
      rating: 'store_rating',
    };

    const sortColumn = allowedSortFields[sortBy] || 'u.name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortColumn} ${direction}`;

    const [users] = await pool.query(query, params);

    return res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        createdAt: u.created_at,
        storeRating: u.role === 'STORE_OWNER' ? Number(u.store_rating) : null,
        storeRatingCount: u.role === 'STORE_OWNER' ? Number(u.store_rating_count) : null,
        storeName: u.role === 'STORE_OWNER' ? u.store_name : null,
      })),
    });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// View single user details
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      `SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS store_rating,
        COUNT(r.id) AS store_rating_count,
        s.id AS store_id,
        s.name AS store_name,
        s.address AS store_address
      FROM users u
      LEFT JOIN stores s ON (s.owner_id = u.id OR s.email = u.email)
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE u.id = ?
      GROUP BY u.id, s.id, s.name, s.address`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const u = users[0];
    return res.json({
      success: true,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        createdAt: u.created_at,
        store: u.store_id ? {
          id: u.store_id,
          name: u.store_name,
          address: u.store_address,
          rating: Number(u.store_rating),
          totalRatings: Number(u.store_rating_count),
        } : null,
      },
    });
  } catch (error) {
    console.error('getUserDetails error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user details.' });
  }
};

// Add new user (Admin, Normal User, or Store Owner)
// Document: "Can add new users with the following details: Name, Email, Password, Address"
const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'USER' } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const allowedRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
    const assignedRole = allowedRoles.includes(role) ? role : 'USER';

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, address.trim(), assignedRole]
    );

    return res.status(201).json({
      success: true,
      message: `${assignedRole === 'ADMIN' ? 'Admin' : assignedRole === 'STORE_OWNER' ? 'Store Owner' : 'Normal User'} created successfully.`,
      user: {
        id: result.insertId,
        name: name.trim(),
        email: cleanEmail,
        address: address.trim(),
        role: assignedRole,
      },
    });
  } catch (error) {
    console.error('addUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
};

// View list of stores with Name, Email, Address, Rating
// Document: "Can view a list of stores with the following details: Name, Email, Address, Rating"
// Document: "Can apply filters on all listings based on Name, Email, Address"
// Document: "All tables should support sorting (ascending/descending) for key fields like Name, Email, etc."
const getStores = async (req, res) => {
  try {
    const { name, email, address, search, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let query = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.created_at,
        s.owner_id,
        u.name AS owner_name,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (name) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${name}%`);
    }

    if (email) {
      query += ` AND s.email LIKE ?`;
      params.push(`%${email}%`);
    }

    if (address) {
      query += ` AND s.address LIKE ?`;
      params.push(`%${address}%`);
    }

    query += ` GROUP BY s.id, u.name`;

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'rating',
      created_at: 's.created_at',
    };

    const sortColumn = allowedSortFields[sortBy] || 's.name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortColumn} ${direction}`;

    const [stores] = await pool.query(query, params);

    return res.json({
      success: true,
      stores: stores.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        rating: Number(s.rating),
        totalRatings: Number(s.total_ratings),
        ownerId: s.owner_id,
        ownerName: s.owner_name,
        createdAt: s.created_at,
      })),
    });
  } catch (error) {
    console.error('getStores error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch stores.' });
  }
};

// Add new store
// Document: "Can add new stores"
const addStore = async (req, res) => {
  try {
    const { name, email, address, ownerPassword } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Check if store with this email already exists
    const [existingStore] = await pool.query('SELECT id FROM stores WHERE email = ?', [cleanEmail]);
    if (existingStore.length > 0) {
      return res.status(409).json({ success: false, message: 'A store with this email already exists.' });
    }

    // Check if user already exists for this email
    let ownerId = null;
    const [existingUser] = await pool.query('SELECT id, role FROM users WHERE email = ?', [cleanEmail]);

    if (existingUser.length > 0) {
      ownerId = existingUser[0].id;
      // Ensure role is STORE_OWNER
      if (existingUser[0].role !== 'ADMIN') {
        await pool.query('UPDATE users SET role = "STORE_OWNER" WHERE id = ?', [ownerId]);
      }
    } else {
      // Create a store owner user account so the store owner can log in
      // Default password if not provided: StoreOwner@123
      const passToUse = ownerPassword && ownerPassword.trim().length >= 8 ? ownerPassword.trim() : 'StoreOwner@123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(passToUse, salt);

      // Name validation: min 20 chars
      let ownerName = `${name.trim()} Store Owner`;
      if (ownerName.length < 20) {
        ownerName = `${ownerName} Representative`;
      }
      if (ownerName.length > 60) {
        ownerName = ownerName.substring(0, 60);
      }

      const [userResult] = await pool.query(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [ownerName, cleanEmail, hashedPassword, address.trim(), 'STORE_OWNER']
      );
      ownerId = userResult.insertId;
    }

    const [storeResult] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, address.trim(), ownerId]
    );

    return res.status(201).json({
      success: true,
      message: 'Store created successfully with linked store owner account.',
      store: {
        id: storeResult.insertId,
        name: name.trim(),
        email: cleanEmail,
        address: address.trim(),
        ownerId,
        rating: 0,
        totalRatings: 0,
      },
    });
  } catch (error) {
    console.error('addStore error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create store.' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserDetails,
  addUser,
  getStores,
  addStore,
};

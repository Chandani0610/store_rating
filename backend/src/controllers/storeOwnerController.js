const { pool } = require('../config/db');

// Store Owner Dashboard
// Document: "View a list of users who have submitted ratings for their store."
// Document: "See the average rating of their store."
// Document: "All tables should support sorting (ascending/descending) for key fields like Name, Email, etc."
const getStoreOwnerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { sortBy = 'date', sortOrder = 'desc', search } = req.query;

    // Find the store owned by this user
    const [stores] = await pool.query(
      'SELECT id, name, email, address, created_at FROM stores WHERE owner_id = ? OR email = ? LIMIT 1',
      [userId, userEmail]
    );

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        hasStore: false,
        message: 'No store currently assigned to your account. Please contact the administrator.',
        store: null,
        averageRating: 0,
        totalRatings: 0,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        ratings: [],
      });
    }

    const store = stores[0];

    // Compute average rating and count
    const [[stats]] = await pool.query(
      `SELECT 
        ROUND(COALESCE(AVG(rating), 0), 1) AS average_rating,
        COUNT(id) AS total_ratings
       FROM ratings WHERE store_id = ?`,
      [store.id]
    );

    // Get rating distribution breakdown
    const [distribution] = await pool.query(
      `SELECT rating, COUNT(*) AS count FROM ratings WHERE store_id = ? GROUP BY rating`,
      [store.id]
    );

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach(d => {
      breakdown[d.rating] = Number(d.count);
    });

    // Fetch users who submitted ratings with sorting & optional search
    let ratingsQuery = `
      SELECT 
        r.id AS rating_id,
        r.rating,
        r.created_at AS rated_at,
        r.updated_at AS updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
    `;
    const params = [store.id];

    if (search) {
      ratingsQuery += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const sortMap = {
      name: 'u.name',
      email: 'u.email',
      rating: 'r.rating',
      date: 'r.updated_at',
    };

    const sortColumn = sortMap[sortBy] || 'r.updated_at';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    ratingsQuery += ` ORDER BY ${sortColumn} ${direction}`;

    const [userRatings] = await pool.query(ratingsQuery, params);

    return res.json({
      success: true,
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        createdAt: store.created_at,
      },
      averageRating: Number(stats.average_rating) || 0,
      totalRatings: Number(stats.total_ratings) || 0,
      ratingBreakdown: breakdown,
      ratings: userRatings.map(r => ({
        id: r.rating_id,
        rating: Number(r.rating),
        ratedAt: r.rated_at,
        updatedAt: r.updated_at,
        user: {
          id: r.user_id,
          name: r.user_name,
          email: r.user_email,
          address: r.user_address,
        },
      })),
    });
  } catch (error) {
    console.error('getStoreOwnerDashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve store owner dashboard.' });
  }
};

module.exports = {
  getStoreOwnerDashboard,
};

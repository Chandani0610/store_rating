const { pool } = require('../config/db');

// List of all registered stores for Normal User / Public with user's submitted rating
// Document: "Can view a list of all registered stores."
// Document: "Can search for stores by Name and Address."
// Document: "Store listings should display: Store Name, Address, Overall Rating, User's Submitted Rating, Option to submit a rating, Option to modify their submitted rating"
// Document: "All tables should support sorting (ascending/descending) for key fields like Name, Email, etc."
const getStoresForUser = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { search, name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let query = `
      SELECT 
        s.id,
        s.name,
        s.address,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS overall_rating,
        COUNT(DISTINCT r.id) AS total_ratings,
        ur.rating AS user_submitted_rating,
        ur.updated_at AS user_rated_at
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON (s.id = ur.store_id AND ur.user_id = ?)
      WHERE 1=1
    `;
    const params = [userId];

    if (search) {
      query += ` AND (s.name LIKE ? OR s.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (name) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${name}%`);
    }

    if (address) {
      query += ` AND s.address LIKE ?`;
      params.push(`%${address}%`);
    }

    query += ` GROUP BY s.id, ur.rating, ur.updated_at`;

    const sortMap = {
      name: 's.name',
      address: 's.address',
      overallRating: 'overall_rating',
      userRating: 'user_submitted_rating',
    };

    const sortCol = sortMap[sortBy] || 's.name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortCol} ${direction}`;

    const [stores] = await pool.query(query, params);

    return res.json({
      success: true,
      stores: stores.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address,
        overallRating: Number(s.overall_rating),
        totalRatings: Number(s.total_ratings),
        userSubmittedRating: s.user_submitted_rating !== null ? Number(s.user_submitted_rating) : null,
        userRatedAt: s.user_rated_at,
      })),
    });
  } catch (error) {
    console.error('getStoresForUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stores.' });
  }
};

// Submit or modify rating (1 to 5)
// Document: "Can submit ratings (between 1 to 5) for individual stores."
// Document: "Option to submit a rating / Option to modify their submitted rating"
const submitOrUpdateRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = parseInt(req.params.id, 10);
    const rating = parseInt(req.body.rating, 10);

    if (isNaN(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid store ID.' });
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    // Verify store exists
    const [stores] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Check if user already submitted a rating
    const [existing] = await pool.query('SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);
    const isModification = existing.length > 0;

    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP`,
      [userId, storeId, rating]
    );

    // Calculate new store overall rating
    const [[newStats]] = await pool.query(
      `SELECT ROUND(COALESCE(AVG(rating), 0), 1) AS overall_rating, COUNT(id) AS total_ratings
       FROM ratings WHERE store_id = ?`,
      [storeId]
    );

    return res.json({
      success: true,
      message: isModification
        ? `Successfully modified rating to ${rating} star(s) for ${stores[0].name}.`
        : `Successfully submitted rating of ${rating} star(s) for ${stores[0].name}.`,
      data: {
        storeId,
        userSubmittedRating: rating,
        overallRating: Number(newStats.overall_rating),
        totalRatings: Number(newStats.total_ratings),
        isModification,
      },
    });
  } catch (error) {
    console.error('submitOrUpdateRating error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit rating.' });
  }
};

module.exports = {
  getStoresForUser,
  submitOrUpdateRating,
};

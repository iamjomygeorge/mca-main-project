const express = require("express");
const router = express.Router();
const pool = require("../../config/database");

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", role } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, full_name, email, role, created_at, is_banned,
             (SELECT COUNT(*) FROM purchases WHERE user_id = users.id AND status = 'COMPLETED') as purchase_count
      FROM users
      WHERE role != 'ADMIN'
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    const countQuery = `SELECT COUNT(*) FROM (${query}) as temp`;
    const totalResult = await pool.query(countQuery, params);
    const total = parseInt(totalResult.rows[0].count, 10);

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${
      paramCount + 1
    }`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      users: result.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    req.log.error(error, "Error fetching users");
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const userQuery = `
      SELECT id, full_name, email, role, created_at, two_factor_enabled, auth_method, is_banned
      FROM users WHERE id = $1 AND role != 'ADMIN'
    `;

    const purchasesQuery = `
      SELECT p.id, b.title as book_title, p.purchase_price, p.status, p.created_at
      FROM purchases p
      LEFT JOIN books b ON p.book_id = b.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT 20
    `;

    const [userResult, purchasesResult] = await Promise.all([
      pool.query(userQuery, [id]),
      pool.query(purchasesQuery, [id]),
    ]);

    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "User not found or access denied" });
    }

    res.json({
      user: userResult.rows[0],
      purchases: purchasesResult.rows,
    });
  } catch (error) {
    req.log.error(error, "Error fetching user details");
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_banned } = req.body;

    const checkAdmin = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [id]
    );
    if (checkAdmin.rows.length > 0 && checkAdmin.rows[0].role === "ADMIN") {
      return res.status(403).json({ message: "Cannot ban an administrator." });
    }

    const result = await pool.query(
      "UPDATE users SET is_banned = $1 WHERE id = $2 RETURNING id, is_banned",
      [is_banned, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    req.log.info(
      { userId: id, banned: is_banned },
      "User status updated by admin"
    );
    res.json(result.rows[0]);
  } catch (error) {
    req.log.error(error, "Error updating user status");
    next(error);
  }
});

module.exports = router;

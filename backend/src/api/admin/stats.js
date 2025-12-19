const express = require("express");
const router = express.Router();
const pool = require("../../config/database");
const { subDays, format, startOfDay, endOfDay } = require("date-fns");

const fillDates = (data, days = 30) => {
  const result = [];
  const map = new Map(
    data.map((item) => [format(new Date(item.date), "yyyy-MM-dd"), item.value])
  );

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateKey = format(date, "yyyy-MM-dd");
    result.push({
      date: format(date, "MMM dd"),
      value: Number(map.get(dateKey) || 0),
    });
  }
  return result;
};

router.get("/overview", async (req, res, next) => {
  try {
    const [totalBooksResult, totalAuthorsResult, totalReadersResult] =
      await Promise.all([
        pool.query("SELECT COUNT(*) FROM books"),
        pool.query("SELECT COUNT(*) FROM authors"),
        pool.query("SELECT COUNT(*) FROM users WHERE role = $1", ["READER"]),
      ]);

    const stats = {
      totalBooks: parseInt(totalBooksResult.rows[0].count, 10),
      totalAuthors: parseInt(totalAuthorsResult.rows[0].count, 10),
      totalReaders: parseInt(totalReadersResult.rows[0].count, 10),
    };

    res.json(stats);
  } catch (error) {
    req.log.error(error, "Error fetching overview stats");
    next(error);
  }
});

router.get("/charts", async (req, res, next) => {
  try {
    // 1. Get Revenue Data (Last 30 days)
    const revenueQuery = `
      SELECT DATE(created_at) as date, SUM(purchase_price) as value 
      FROM purchases 
      WHERE status = 'COMPLETED' 
      AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    // 2. Get User Growth Data (Last 30 days)
    const usersQuery = `
      SELECT DATE(created_at) as date, COUNT(*) as value 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    const [revenueResult, usersResult] = await Promise.all([
      pool.query(revenueQuery),
      pool.query(usersQuery),
    ]);

    const charts = {
      revenue: fillDates(revenueResult.rows),
      users: fillDates(usersResult.rows),
    };

    res.json(charts);
  } catch (error) {
    req.log.error(error, "Error fetching chart stats");
    next(error);
  }
});

router.get("/recent-activity", async (req, res, next) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.purchase_price,
        p.created_at,
        p.status,
        u.full_name as user_name,
        u.email as user_email,
        b.title as book_title,
        b.cover_image_url
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN books b ON p.book_id = b.id
      WHERE p.status = 'COMPLETED'
      ORDER BY p.created_at DESC
      LIMIT 5
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    req.log.error(error, "Error fetching recent activity");
    next(error);
  }
});

module.exports = router;

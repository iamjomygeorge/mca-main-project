const express = require("express");
const router = express.Router();
const pool = require("../../config/database");

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, full_name as name, email, message, status, created_at
      FROM contact_messages
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (status && status !== "ALL") {
      query += ` AND status = $${paramCount}`;
      params.push(status);
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
      messages: result.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    req.log.error(error, "Error fetching messages");
    next(error);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    req.log.info({ messageId: id, status }, "Message status updated");
    res.json(result.rows[0]);
  } catch (error) {
    req.log.error(error, "Error updating message status");
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM contact_messages WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    req.log.info({ messageId: id }, "Message deleted");
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    req.log.error(error, "Error deleting message");
    next(error);
  }
});

module.exports = router;

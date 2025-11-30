const express = require("express");
const router = express.Router();
const pool = require("../../config/database");

const { messageStatusRules } = require("./admin.validator");
const validate = require("../../middleware/validation.middleware");

router.get("/", async (req, res, next) => {
  try {
    const messagesResult = await pool.query(`
      SELECT
        cm.id,
        cm.full_name,
        cm.email,
        cm.message,
        cm.status,
        cm.created_at,
        cm.user_id,
        u.role AS user_role
      FROM contact_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      ORDER BY
        CASE cm.status
          WHEN 'NEW' THEN 1
          WHEN 'READ' THEN 2
          WHEN 'RESOLVED' THEN 3
        END ASC,
        cm.created_at DESC
    `);
    res.json(messagesResult.rows);
  } catch (err) {
    req.log.error(err, "Error fetching contact messages");
    next(err);
  }
});

router.put(
  "/:id/status",
  messageStatusRules(),
  validate,
  async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const updateResult = await pool.query(
        "UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *",
        [status, id]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: "Message not found." });
      }

      res.json(updateResult.rows[0]);
    } catch (err) {
      req.log.error(err, "Error updating message status");
      next(err);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const deleteResult = await pool.query(
      "DELETE FROM contact_messages WHERE id = $1",
      [id]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Message not found." });
    }

    res.status(204).send();
  } catch (err) {
    req.log.error(err, "Error deleting message");
    next(err);
  }
});

module.exports = router;

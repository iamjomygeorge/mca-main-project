const express = require("express");
const router = express.Router();
const pool = require("../../config/database");

const { messageStatusRules } = require("./validator");
const validate = require("../../middleware/validate");

router.get("/", async (req, res) => {
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
    console.error("Error fetching contact messages:", err);
    res.status(500).json({ error: "Failed to retrieve messages." });
  }
});

router.put(
  "/:id/status",
  messageStatusRules(),
  validate,
  async (req, res) => {
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
      console.error("Error updating message status:", err);
      res.status(500).json({ error: "Failed to update message." });
    }
  }
);

router.delete("/:id", async (req, res) => {
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
    console.error("Error deleting message:", err);
    res.status(500).json({ error: "Failed to delete message." });
  }
});

module.exports = router;

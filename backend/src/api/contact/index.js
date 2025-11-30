const express = require("express");
const pool = require("../../config/database");

const { contactRules } = require("./contact.validator");
const validate = require("../../middleware/validation.middleware");

const router = express.Router();

router.post("/", contactRules(), validate, async (req, res, next) => {
  const { fullName, email, message } = req.body;
  let userId = null;

  const client = await pool.connect();

  try {
    const userResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
      req.log.info({ userId, email }, "Contact form: Found matching user.");
    } else {
      req.log.info({ email }, "Contact form: Guest message.");
    }

    await client.query(
      `INSERT INTO contact_messages (full_name, email, message, user_id, status)
         VALUES ($1, $2, $3, $4, 'NEW')`,
      [fullName, email, message, userId]
    );

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (err) {
    req.log.error(err, "Contact Form API Error");
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;

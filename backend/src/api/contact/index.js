const express = require("express");
const pool = require("../../config/database");

const { contactRules } = require("./contact.validator");
const validate = require("../../middleware/validation.middleware");

const router = express.Router();

router.post("/", contactRules(), validate, async (req, res) => {
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
      console.log(
        `Contact form: Found matching user ID ${userId} for email ${email}`
      );
    } else {
      console.log(
        `Contact form: No matching user found for email ${email}. Storing as guest message.`
      );
    }

    await client.query(
      `INSERT INTO contact_messages (full_name, email, message, user_id, status)
         VALUES ($1, $2, $3, $4, 'NEW')`,
      [fullName, email, message, userId]
    );

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Contact Form API Error:", err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try again later." });
  } finally {
    client.release();
  }
});

module.exports = router;

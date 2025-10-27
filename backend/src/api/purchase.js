const express = require("express");
const pool = require("../config/database");
const authenticateToken = require("../middleware/authenticateToken");
const { body, validationResult } = require("express-validator");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

const PLATFORM_COMMISSION_RATE = parseFloat(
  process.env.PLATFORM_COMMISSION_RATE || "0.15"
);

router.post(
  "/initiate",
  authenticateToken,
  [body("bookId").isUUID().withMessage("Valid Book ID is required.")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }

    const { bookId } = req.body;
    const userId = req.user.userId;
    const client = await pool.connect();
    let purchaseId;

    try {
      await client.query("BEGIN");

      const ownershipCheck = await client.query(
        "SELECT 1 FROM user_library WHERE user_id = $1 AND book_id = $2",
        [userId, bookId]
      );
      if (ownershipCheck.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "You already own this book." });
      }

      const bookResult = await client.query(
        "SELECT title, price, currency FROM books WHERE id = $1",
        [bookId]
      );
      if (bookResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Book not found." });
      }
      const {
        title: bookTitle,
        price: bookPrice,
        currency: bookCurrency,
      } = bookResult.rows[0];

      const price = parseFloat(bookPrice);
      if (price <= 0) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "This book is free and does not require purchase." });
      }

      const pendingCheck = await client.query(
        "SELECT id FROM purchases WHERE user_id = $1 AND book_id = $2 AND status = 'PENDING'",
        [userId, bookId]
      );

      if (pendingCheck.rows.length > 0) {
        purchaseId = pendingCheck.rows[0].id;
        console.log(`Reusing existing PENDING purchase ID: ${purchaseId}`);
        await client.query("UPDATE purchases SET updated_at = current_timestamp WHERE id = $1", [purchaseId]);
      } else {
        const platformFee = (price * PLATFORM_COMMISSION_RATE).toFixed(2);
        const authorRevenue = (price - parseFloat(platformFee)).toFixed(2);

        const purchaseResult = await client.query(
          `INSERT INTO purchases
             (user_id, book_id, purchase_price, purchase_currency, status, platform_fee, author_revenue)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            userId,
            bookId,
            price.toFixed(2),
            bookCurrency,
            "PENDING",
            platformFee,
            authorRevenue,
          ]
        );
        purchaseId = purchaseResult.rows[0].id;
        console.log(`Created new PENDING purchase ID: ${purchaseId}`);
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: bookCurrency.toLowerCase(),
              product_data: {
                name: bookTitle,
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/books/${bookId}?purchase=cancelled`,
        client_reference_id: purchaseId,
        metadata: {
          purchaseId: purchaseId,
          bookId: bookId,
          userId: userId,
        },
      });

      await client.query("COMMIT");
      res.json({ checkoutUrl: session.url });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Purchase Initiation Error:", err);
      const errorMessage =
        err.type === "StripeCardError"
          ? err.message
          : "Internal Server Error creating payment session.";
      res.status(500).json({ error: errorMessage });
    } finally {
      client.release();
    }
  }
);

router.get("/my-library", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const libraryResult = await pool.query(
      `SELECT
               b.id, b.title, b.description, b.cover_image_url, b.created_at, b.featured,
               a.name AS author_name,
               ul.added_at
             FROM user_library ul
             JOIN books b ON ul.book_id = b.id
             JOIN authors a ON b.author_id = a.id
             WHERE ul.user_id = $1
             ORDER BY ul.added_at DESC`,
      [userId]
    );
    res.json(libraryResult.rows);
  } catch (err) {
    console.error("Get My Library Error:", err);
    res.status(500).json({ error: "Internal Server Error fetching library." });
  }
});

module.exports = router;
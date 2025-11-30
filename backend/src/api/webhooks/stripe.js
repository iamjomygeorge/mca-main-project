const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pool = require("../../config/database");

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (!sig || !webhookSecret) {
        req.log.error(
          "Webhook Error: Missing Stripe signature or webhook secret."
        );
        return res.status(400).send("Webhook Error: Configuration issue.");
      }
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      req.log.error(err, "Webhook signature verification failed.");
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        req.log.info(
          { sessionId: session.id },
          "Webhook received: checkout.session.completed"
        );

        await handleCheckoutSessionCompleted(session, req.log || console);

        break;
      default:
        req.log.info({ type: event.type }, "Unhandled event type");
    }

    res.json({ received: true });
  }
);

async function handleCheckoutSessionCompleted(session, logger) {
  const purchaseId =
    session.client_reference_id || session.metadata?.purchaseId;
  const stripePaymentIntentId = session.payment_intent;

  if (!purchaseId) {
    logger.error(
      { sessionId: session.id },
      "Webhook Error: Could not find purchaseId in session."
    );
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const purchaseResult = await client.query(
      "SELECT id, user_id, book_id, status FROM purchases WHERE id = $1 FOR UPDATE",
      [purchaseId]
    );

    if (purchaseResult.rows.length === 0) {
      logger.warn({ purchaseId }, "Webhook: Purchase not found.");
      await client.query("ROLLBACK");
      return;
    }

    const purchase = purchaseResult.rows[0];

    if (purchase.status !== "PENDING") {
      logger.info(
        { purchaseId, status: purchase.status },
        "Webhook: Purchase already processed."
      );
      await client.query("ROLLBACK");
      return;
    }

    await client.query(
      "UPDATE purchases SET status = 'COMPLETED', transaction_id = $2, updated_at = current_timestamp WHERE id = $1",
      [purchase.id, stripePaymentIntentId]
    );

    await client.query(
      "INSERT INTO user_library (user_id, book_id) VALUES ($1, $2) ON CONFLICT (user_id, book_id) DO NOTHING",
      [purchase.user_id, purchase.book_id]
    );

    await client.query("COMMIT");
    logger.info({ purchaseId }, "Webhook: Successfully processed purchase.");
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error(err, `Webhook: Error processing purchase ${purchaseId}`);
  } finally {
    client.release();
  }
}

module.exports = router;

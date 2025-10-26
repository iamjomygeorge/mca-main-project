const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pool = require("../config/database");

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
        console.error(
          "Webhook Error: Missing Stripe signature or webhook secret."
        );
        return res.status(400).send("Webhook Error: Configuration issue.");
      }
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log(
          `Webhook received: Payment successful for session: ${session.id}`
        );

        await handleCheckoutSessionCompleted(session);

        break;
      // TODO: Handle other event types if needed (e.g., payment_failed)
      // case 'checkout.session.async_payment_failed':
      //   const failedSession = event.data.object;
      //   // Logic to mark purchase as FAILED
      //   break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

async function handleCheckoutSessionCompleted(session) {
  const purchaseId =
    session.client_reference_id || session.metadata?.purchaseId;
  const stripePaymentIntentId = session.payment_intent;

  if (!purchaseId) {
    console.error(
      `Webhook Error: Could not find purchaseId in session ${session.id}. ClientRef: ${session.client_reference_id}, Metadata: ${session.metadata?.purchaseId}`
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
      console.warn(`Webhook: Purchase ${purchaseId} not found.`);
      await client.query("ROLLBACK");
      return;
    }

    const purchase = purchaseResult.rows[0];

    if (purchase.status !== "PENDING") {
      console.log(
        `Webhook: Purchase ${purchaseId} already processed (status: ${purchase.status}). Skipping.`
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
    console.log(
      `Webhook: Successfully processed purchase ${purchaseId} linked to session ${session.id}.`
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`Webhook: Error processing purchase ${purchaseId}:`, err);
  } finally {
    client.release();
  }
}

module.exports = router;
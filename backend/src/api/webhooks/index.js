const express = require('express');
const router = express.Router();
const stripeWebhook = require('./stripe');

router.use('/', stripeWebhook);

module.exports = router;
import crypto from 'crypto';

// Vercel serverless function -- confirms a payment actually happened before the
// client is allowed to treat an order as paid. Razorpay's checkout widget returns
// a signature that only someone holding the Key Secret can produce/verify; if this
// doesn't match, the payment claim is not trustworthy and must be rejected.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    res.status(500).json({ verified: false, error: 'Payment gateway is not configured.' });
    return;
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ verified: false, error: 'Missing payment details.' });
    return;
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  // Timing-safe comparison -- see the identical note in verify-free-order.js.
  const expectedBuf = Buffer.from(expected, 'hex');
  const givenBuf = Buffer.from(String(razorpay_signature), 'hex');
  const verified = expectedBuf.length === givenBuf.length && crypto.timingSafeEqual(expectedBuf, givenBuf);
  res.status(verified ? 200 : 400).json({ verified });
}
